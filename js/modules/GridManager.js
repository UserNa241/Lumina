// js/modules/GridManager.js
import {generateBatch} from "../data/projects.js";

export default class GridManager {
	constructor() {
		this.grid = document.getElementById("work-grid-content");
		if (!this.grid) return;

		/* -----------------------------
		 HARD-CODED TUNING (for now)
		 ----------------------------- */
		this.idealWidth = 250;        // column target width (controls column count)
		this.gap = 16;                // px gap between items

		// Runway trigger (scroll-driven, hysteresis)
		this.enterPx = 1200;           // trigger when grid bottom is within this distance
		this.exitPx = 2400;           // rearm after bottom is farther than this distance
		this.rowsPerTrigger = 2;      // how many rows of skeleton runway to inject per trigger

		// Initial load runway
		this.initialRows = 6;         // inject immediately on page load

		// Premium swap cadence (row-by-row)
		this.swapCadenceMs = 200;

		// Skeleton visual variety (height = colWidth * ratio)
		this.skeletonRatioMin = 0.5;
		this.skeletonRatioMax = 1.0;

		this.minPendingRows = 3;     // if queue drops below this while still in danger, jumpstart
		this.maxPendingRows = 18;    // safety cap to prevent runaway skeleton buildup
		this.lastJumpMs = 0;
		this.jumpCooldownMs = 250;   // minimum time between jumpstarts


		/* -----------------------------
		 STATE
		 ----------------------------- */
		this.currentIdCount = 0;
		this.queue = [];              // queued rows: { skeletons: [...] }
		this.isResolving = false;

		// Scroll trigger state
		this.inDangerZone = false;
		this.scrollTicking = false;
		this.isReserving = false;

		/* -----------------------------
		 BIND
		 ----------------------------- */
		this.onScroll = this.onScroll.bind(this);
		this.checkRunway = this.checkRunway.bind(this);
		this.processQueue = this.processQueue.bind(this);
		this.layout = this.layout.bind(this);

		this.init();
	}

	/* =========================================================
	 INIT
	 ========================================================= */
	init() {
		// 1) Initial skeleton runway
		this.reserveRows(this.initialRows);

		// 2) Commit layout/height so the page can scroll
		this.layout();

		// 3) Start resolving the initial rows
		this.processQueue();

		// 4) Scroll-driven trigger (RAF-throttled)
		window.addEventListener("scroll", this.onScroll, {passive: true});

		// 5) Resize: relayout and re-check runway
		window.addEventListener("resize", () => {
			this.layout();
			this.checkRunway();
		});

		this.updateCounter();
	}

	/* =========================================================
	 SCROLL TRIGGER (Hysteresis)
	 - enterPx triggers once
	 - exitPx rearms
	 ========================================================= */
	onScroll() {
		if (this.scrollTicking) return;
		this.scrollTicking = true;

		requestAnimationFrame(() => {
			this.scrollTicking = false;
			this.checkRunway();
		});
	}

	checkRunway() {
		// distance from viewport bottom to grid bottom
		const distance = this.grid.getBoundingClientRect().bottom - window.innerHeight;

		// Rearm when safely away
		if (distance > this.exitPx) {
			this.inDangerZone = false;
		}

		// Normal trigger: only once per enter/exit cycle
		if (!this.inDangerZone && distance <= this.enterPx) {
			this.inDangerZone = true;

			// Reserve runway instantly + layout immediately (expands scroll height)
			this.reserveRows(this.rowsPerTrigger);
			this.layout();

			// Resolve in background (premium row swaps)
			this.processQueue();

			return; // important: don't immediately fall through to jumpstart on same frame
		}

		/* -----------------------------
		 JUMPSTART FAILSAFE
		 If we are still in danger but runway is running out,
		 force another reserve even though inDangerZone is already true.
		 ----------------------------- */
		const pendingRows = this.queue.length;
		const now = performance.now();

		const shouldJump =
			this.inDangerZone &&
			distance <= this.enterPx &&
			!this.isReserving &&
			pendingRows < this.minPendingRows &&
			pendingRows < this.maxPendingRows &&
			(now - this.lastJumpMs) > this.jumpCooldownMs;

		if (shouldJump) {
			this.lastJumpMs = now;

			this.reserveRows(this.rowsPerTrigger);
			this.layout();
			this.processQueue();
		}
	}

	/* =========================================================
	 RESERVATION (Skeleton injection)
	 ========================================================= */
	reserveRows(rowCount) {
		if (this.isReserving) return;
		this.isReserving = true;

		try {
			const {columns} = this.getMetrics();

			for (let r = 0; r < rowCount; r++) {
				this.reserveOneRow(columns);
			}
		} finally {
			this.isReserving = false;
		}
	}

	reserveOneRow(cols) {
		const frag = document.createDocumentFragment();
		const skeletons = [];

		for (let i = 0; i < cols; i++) {
			const el = document.createElement("div");
			el.className = "card-skeleton";

			const ratio =
				(Math.random() * (this.skeletonRatioMax - this.skeletonRatioMin) + this.skeletonRatioMin)
					.toFixed(3);

			el.dataset.ratio = ratio;
			frag.appendChild(el);
			skeletons.push(el);
		}

		this.grid.appendChild(frag);
		this.queue.push({skeletons});
	}

	/* =========================================================
	 RESOLUTION (Row-by-row swap, premium cadence)
	 ========================================================= */
	async processQueue() {
		if (this.isResolving) return;
		this.isResolving = true;

		try {
			while (this.queue.length) {
				const batch = this.queue.shift();
				await this.resolveRow(batch);

				// Relayout after each row swap
				this.layout();

				// Premium cadence
				await this.delay(this.swapCadenceMs);
			}
		} finally {
			this.isResolving = false;
		}
	}

	async resolveRow(batch) {
		const count = batch.skeletons.length;

		const data = this.fetchBatchData(count);
		await this.preloadImages(data);

		const cards = data.map((p) => this.createCard(p));

		// Swap the whole row at once
		for (let i = 0; i < count; i++) {
			batch.skeletons[i].replaceWith(cards[i]);
		}

		this.updateCounter();
	}

	fetchBatchData(count) {
		const startId = this.currentIdCount + 1;
		const data = generateBatch(count, startId);
		this.currentIdCount += count;
		return data;
	}

	preloadImages(projects) {
		return Promise.all(
			projects.map((p) => {
				return new Promise((resolve) => {
					const img = new Image();
					img.src = p.image;

					const done = () => {
						const w = img.naturalWidth || 1;
						const h = img.naturalHeight || 1;
						p._ratio = h / w;
						resolve();
					};

					if (img.complete) done();
					else {
						img.onload = done;
						img.onerror = () => {
							p._ratio = 1.2;
							resolve();
						};
					}
				});
			})
		);
	}

	createCard(project) {
		const el = document.createElement("article");
		el.className = "project-card";
		el.setAttribute("data-category", project.category);

		el.innerHTML = `
      <a href="#" class="project-card__link">
        <div class="project-card__media">
          <img src="${project.image}" alt="${project.title}" loading="lazy">
          <div class="project-card__overlay">
            <h2 class="project-card__title">${project.title}</h2>
            <span class="project-card__year">${project.year}</span>
          </div>
        </div>
      </a>
    `;

		el.classList.add("is-visible");
		setTimeout(() => el.classList.add("is-loaded"), 600);
		return el;
	}

	delay(ms) {
		return new Promise((r) => setTimeout(r, ms));
	}

	/* =========================================================
	 LAYOUT (Masonry, serial columns – NOT shortest-column)
	 ========================================================= */
	getMetrics() {
		const containerWidth = this.grid.getBoundingClientRect().width;
		const columns = Math.max(1, Math.floor(containerWidth / this.idealWidth));

		const totalGap = (columns - 1) * this.gap;
		const colWidth = (containerWidth - totalGap) / columns;

		return {containerWidth, columns, colWidth};
	}

	layout() {
		const items = this.grid.querySelectorAll(".project-card, .card-skeleton");
		if (!items.length) return;

		const {columns, colWidth} = this.getMetrics();

		// Pass 1: widths + skeleton heights (so measurement stable)
		items.forEach((item) => {
			item.style.width = `${colWidth}px`;

			if (item.classList.contains("card-skeleton")) {
				const ratio = parseFloat(item.dataset.ratio || "1.2");
				item.style.height = `${colWidth * ratio}px`;
			}
		});

		// Pass 2: serial masonry placement
		const colHeights = new Array(columns).fill(0);

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const col = i % columns;

			const x = col * (colWidth + this.gap);
			const y = colHeights[col];

			item.style.transform = `translate3d(${x}px, ${y}px, 0)`;

			const h = item.offsetHeight;
			colHeights[col] += h + this.gap;
		}

		const maxHeight = Math.max(...colHeights);
		this.grid.style.height = `${Math.max(0, maxHeight - this.gap)}px`;
	}

	updateCounter() {
		const counter = document.querySelector(".work-count");
		if (!counter) return;
		const count = this.grid.querySelectorAll(".project-card").length;
		counter.textContent = `(${count})`;
	}
}
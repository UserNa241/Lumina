// js/modules/GridManager.js
import {generateBatch} from "../data/projects.js";

export default class GridManager {
	constructor() {
		this.grid = document.getElementById("work-grid-content");
		if (!this.grid) return;

		/* -----------------------------
		 TUNING
		 ----------------------------- */
		this.idealWidth = 250;
		this.gap = 16;

		// Trigger thresholds (distance to CONTENT bottom)
		this.enterPx = 1800;   // when distance <= enterPx, we want to ensure buffer
		this.exitPx = 3200;   // rearm when distance > exitPx

		// Reservation behavior
		this.rowsPerTrigger = 3;
		this.initialRows = 10;

		// Premium cadence between row swaps
		this.swapCadenceMs = 100;

		// HARD CAP: maximum pending skeleton rows (queue batches)
		this.maxPendingRows = 10;

		/* -----------------------------
		 STATE
		 ----------------------------- */
		this.currentIdCount = 0;
		this.activeFilter = 'all'; // Default state

		// queue items: { skeletons: [...], data: [...], preload: Promise }
		this.queue = [];
		this.isResolving = false;
		this.isReserving = false;

		this.inDangerZone = false;
		this.scrollTicking = false;

		// Masonry state
		this.columns = 1;
		this.colWidth = 0;
		this.colHeights = [];
		this.contentHeight = 0;
		this.gridTopDoc = 0;

		// Scroll lock state
		this.scrollLocked = false;
		this.lockedScrollY = 0;

		this.preventScroll = (e) => {
			if (e.deltaY > 0) e.preventDefault(); // block only downward
		};
		/* -----------------------------
		 BIND
		 ----------------------------- */
		this.onScroll = this.onScroll.bind(this);
		this.checkRunway = this.checkRunway.bind(this);
		this.processQueue = this.processQueue.bind(this);
		this.handleResize = this.handleResize.bind(this);

		this.init();
	}

	/* =========================================================
	 INIT
	 ========================================================= */
	init() {
		this.updateGridTopDoc();
		this.syncMetrics(true);

		// Start with up to maxPendingRows skeleton rows
		this.reserveRows(this.initialRows);
		this.commitHeight();

		// Start resolving
		this.processQueue();

		window.addEventListener("scroll", this.onScroll, {passive: true});
		window.addEventListener("resize", this.handleResize);

		this.updateCounter();
	}

	/* =========================================================
	 SCROLL LOCK (prevents reaching footer when buffer is capped)
	 ========================================================= */
	lockScroll() {
		if (this.scrollLocked) return;
		this.scrollLocked = true;
		this.lockedScrollY = window.scrollY;

		window.addEventListener("wheel", this.preventScroll, {passive: false});
		window.addEventListener("touchmove", this.preventScroll, {passive: false});

		// pin scroll position
		window.scrollTo(0, this.lockedScrollY);
	}

	unlockScroll() {
		if (!this.scrollLocked) return;
		this.scrollLocked = false;

		window.removeEventListener("wheel", this.preventScroll);
		window.removeEventListener("touchmove", this.preventScroll);
	}

	/* =========================================================
	 RAF-throttled scroll handler
	 ========================================================= */
	onScroll() {
		if (this.scrollTicking) return;
		this.scrollTicking = true;

		requestAnimationFrame(() => {
			this.scrollTicking = false;
			this.checkRunway();
		});
	}

	/* =========================================================
	 RUNWAY CHECK
	 Key rule:
	 - If we are close to the end AND queue is already at max,
	 lock scrolling so user never reaches footer/empty space.
	 ========================================================= */
	checkRunway() {
		const distance = this.getDistanceToContentBottom();

		// If locked, unlock as soon as we have capacity to reserve again
		// (i.e., queue dropped below cap due to a resolved row).
		if (this.scrollLocked && this.queue.length < this.maxPendingRows) {
			console.log("Unlock Done");
			this.unlockScroll();
		}

		// Rearm when far away
		if (distance > this.exitPx) {
			this.inDangerZone = false;
			return;
		}

		// If near end (or beyond), but we cannot reserve more pending rows -> lock
		if (distance <= (this.enterPx / 6) && this.queue.length >= this.maxPendingRows) {
			console.log("Lock Initiated");
			this.lockScroll();
			return;
		}

		// Normal trigger: reserve more when we enter the zone
		if (!this.inDangerZone && distance <= this.enterPx) {
			this.inDangerZone = true;

			this.reserveRows(this.rowsPerTrigger);
			this.commitHeight();
			this.processQueue();
			return;
		}

		// If already in zone, keep it topped up (lightly) when capacity exists
		if (this.inDangerZone && distance <= this.enterPx && this.queue.length < this.maxPendingRows) {
			this.reserveRows(1); // gentle refill
			this.commitHeight();
			this.processQueue();
		}
	}

	/* =========================================================
	 Distance math to CONTENT bottom (no runway spacer)
	 ========================================================= */
	updateGridTopDoc() {
		const rect = this.grid.getBoundingClientRect();
		this.gridTopDoc = rect.top + window.scrollY;
	}

	getDistanceToContentBottom() {
		const viewportBottomDoc = window.scrollY + window.innerHeight;
		const contentBottomDoc = this.gridTopDoc + this.contentHeight;
		return contentBottomDoc - viewportBottomDoc;
	}

	/* =========================================================
	 METRICS / RESIZE
	 ========================================================= */
	getMetrics() {
		const containerWidth = this.grid.getBoundingClientRect().width;
		const columns = Math.max(1, Math.floor(containerWidth / this.idealWidth));
		const totalGap = (columns - 1) * this.gap;
		const colWidth = (containerWidth - totalGap) / columns;
		return {columns, colWidth};
	}

	syncMetrics(reset = false) {
		const {columns, colWidth} = this.getMetrics();
		const changed = columns !== this.columns;

		this.columns = columns;
		this.colWidth = colWidth;

		if (reset || changed) {
			this.colHeights = new Array(columns).fill(0);
		}

		return changed;
	}

	handleResize() {
		// Never trap user on resize
		this.unlockScroll();

		this.syncMetrics(true);
		this.relayoutAll();
		this.commitHeight();
		this.updateGridTopDoc();
		this.checkRunway();
	}

	/* =========================================================
	 RESERVATION (capped to maxPendingRows)
	 ========================================================= */
	reserveRows(rowCount) {
		if (this.isReserving) return;
		if (this.queue.length >= this.maxPendingRows) return;

		this.isReserving = true;

		try {
			const available = this.maxPendingRows - this.queue.length;
			const rowsToAdd = Math.min(rowCount, available);

			const changed = this.syncMetrics(false);
			if (changed) this.relayoutAll();

			for (let r = 0; r < rowsToAdd; r++) {
				this.reserveOneRow(this.columns);
			}
		} finally {
			this.isReserving = false;
		}
	}

	getShortestColumnIndex() {
		let min = 0;
		for (let c = 1; c < this.colHeights.length; c++) {
			if (this.colHeights[c] < this.colHeights[min]) min = c;
		}
		return min;
	}

	reserveOneRow(cols) {
		const data = this.fetchBatchData(cols);

		const frag = document.createDocumentFragment();
		const skeletons = [];

		for (let i = 0; i < cols; i++) {
			const project = data[i];

			const el = document.createElement("div");
			el.className = "card-skeleton";

			const w = data[i].imageWidth || 1;
			const h = data[i].imageHeight || 1;
			const ratio = h / w;
			el.dataset.ratio = ratio.toFixed(3);

			const height = this.colWidth * ratio;
			el.style.width = `${this.colWidth}px`;
			el.style.height = `${height}px`;


			const isMatch = (this.activeFilter === "all") || (project.category === this.activeFilter);

			if (isMatch) {
				const col = this.getShortestColumnIndex();
				const x = col * (this.colWidth + this.gap);
				const y = this.colHeights[col];

				el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

				el.style.display = "block";

				this.colHeights[col] += height + this.gap;
			} else {
				el.style.display = "none";
				el.style.transform = `translate3d(0px, 0px, 0)`;
			}

			frag.appendChild(el);
			skeletons.push(el);
		}

		this.grid.appendChild(frag);

		// Preload immediately; swap later only when loaded
		const preload = this.preloadImages(data);
		this.queue.push({skeletons, data, preload});
	}

	commitHeight() {
		const maxHeight = Math.max(...this.colHeights);
		this.contentHeight = Math.max(0, maxHeight - this.gap);
		this.grid.style.height = `${this.contentHeight}px`;
		this.updateGridTopDoc();
	}

	/* =========================================================
	 RESOLUTION
	 After each row resolves:
	 - queue shrinks -> unlock becomes possible
	 - we re-check runway and refill if needed
	 ========================================================= */
	async processQueue() {
		if (this.isResolving) return;
		this.isResolving = true;

		try {
			while (this.queue.length) {
				const batch = this.queue.shift();
				await this.resolveRow(batch);

				this.commitHeight();
				this.checkRunway(); // this may unlock + reserve the next row

				await this.delay(this.swapCadenceMs);
			}
		} finally {
			this.isResolving = false;
		}
	}

	async resolveRow(batch) {

		const {skeletons, data, preload} = batch;

		await preload;

		const cards = data.map((p) => this.createCard(p));

		for (let i = 0; i < skeletons.length; i++) {
			const sk = skeletons[i];
			const card = cards[i];

			card.style.width = sk.style.width;
			card.style.height = sk.style.height;
			card.style.transform = sk.style.transform;
			card.dataset.ratio = sk.dataset.ratio;
			card.style.display = sk.style.display;

			sk.replaceWith(card);
		}

		this.updateCounter();
	}

	/* =========================================================
	 DATA + MEDIA
	 ========================================================= */
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
					if (img.complete) resolve();
					else {
						img.onload = resolve;
						img.onerror = resolve;
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
		setTimeout(() => el.classList.add("is-loaded"), 100);

		return el;
	}

	delay(ms) {
		return new Promise((r) => setTimeout(r, ms));
	}

	/* =========================================================
	 RELAYOUT (resize only)
	 ========================================================= */
	relayoutAll() {
		const items = this.grid.querySelectorAll(".project-card, .card-skeleton");

		this.colHeights = new Array(this.columns).fill(0);

		items.forEach((item) => {

			// If the item is hidden by the filter, skip the math entirely.
			if (item.style.display === 'none') return;

			const ratio = parseFloat(item.dataset.ratio || "1.2");
			const h = this.colWidth * ratio;

			item.style.width = `${this.colWidth}px`;
			item.style.height = `${h}px`;

			const col = this.getShortestColumnIndex();
			const x = col * (this.colWidth + this.gap);
			const y = this.colHeights[col];

			item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
			this.colHeights[col] += h + this.gap;
		});
	}

	filter(category) {
		this.activeFilter = category;

		const items = this.grid.querySelectorAll('.project-card');

		items.forEach(el => {
			const cat = el.dataset.category;
			const match = (category === 'all') || (cat === category);

			// VISIBILITY LOGIC
			el.style.display = match ? 'block' : 'none';
		});

		// LAYOUT LOGIC
		this.relayoutAll();

		this.updateCounter();
	}

	updateCounter() {
		const counter = document.querySelector(".work-count");
		if (!counter) return;

		const allCards = this.grid.querySelectorAll(".project-card");

		// Count only visible items
		let visibleCount = 0;
		allCards.forEach(card => {
			if (card.style.display !== 'none') {
				visibleCount++;
			}
		});

		counter.textContent = `(${visibleCount})`;
	}
}
// js/modules/ScrollSync.js

export default class ScrollSync {

	constructor() {

		this.section = document.getElementById("timeline-section");
		this.strip = document.querySelector(".timeline__strip");

		if (!this.strip || !this.section) return;

		this.ticking = false;

		this.onScroll = this.onScroll.bind(this);

		this.init();
	}

	init() {

		window.addEventListener('scroll', this.onScroll, { passive: true });

		this.update();
	}

	onScroll() {

		if (!this.ticking) {
			this.ticking = true;
			window.requestAnimationFrame(() => {
				this.update();
				this.ticking = false;
			});
		}
	}

	update() {

		// Measure Parent Section
		const rect = this.section.getBoundingClientRect();

		const viewportHeight = window.innerHeight;
		const sectionHeight = rect.height;

		// Progress 0.0 -> 1.0
		const distanceScrolled = -rect.top;
		const maxScrollDistance = sectionHeight - viewportHeight;

		let progress = distanceScrolled / maxScrollDistance;

		progress = Math.max(0,Math.min(progress,1));

		// Calculate Horizontal Movement
		const stripWidth = this.strip.scrollWidth;
		const MaxTranslate = stripWidth - window.innerWidth;

		// Apply
		const currentTranslate = progress * MaxTranslate;

		this.strip.style.transform = `translateX(-${currentTranslate}px)`;

	}
}



















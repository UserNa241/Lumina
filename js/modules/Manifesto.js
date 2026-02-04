// js/modules/Manifesto.js

export default class Manifesto {

	constructor() {

		this.track = document.querySelector('.marquee__inner');
		this.images = document.querySelectorAll('[data-speed]');

		if (!this.track) return;

		this.scrollY = 0;
		this.lastScrollY = 0;
		this.pos = 0;

		this.baseSpeed = 1;

		this.render = this.render.bind(this);

		this.init();
	}

	init() {
		this.render();
	}

	render() {

		this.scrollY = window.scrollY;

		const velocity = this.scrollY - this.lastScrollY;
		this.lastScrollY = this.scrollY;

		const speed = this.baseSpeed + (Math.abs(velocity) * 0.2);

		this.pos -= speed;

		const width = this.track.scrollWidth / 2;

		if (this.pos <= -width) {
			this.pos = 0;
		}

		this.track.style.transform = `translateX(${this.pos}px)`;

		this.images.forEach(img => {
			const parallaxSpeed = parseFloat(img.dataset.speed);
			const y = this.scrollY * parallaxSpeed * -1;
			img.style.transform = `translateY(${y}px)`;
		});

		requestAnimationFrame(this.render);
	}

}
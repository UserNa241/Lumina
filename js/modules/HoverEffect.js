// js/modules/HoverEffect.js
import Cursor from "./Cursor.js";
import cursor from "./Cursor.js";

export default class HoverEffect {

	constructor() {

		this.items = document.querySelectorAll('.work-list__item');
		this.rotation = 0;

		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.animate = this.animate.bind(this);

		this.init();
	}

	init() {

		window.addEventListener('scroll', this.handleScroll);

		this.items.forEach((item) => {
			// Find specific Link and image for row
			const link = item.querySelector('.work-list__link');
			const image = item.querySelector('.work-list__preview');

			// Pass specific images
			link.addEventListener('mouseenter', () => this.handleMouseEnter(item, image));
			link.addEventListener('mouseleave', () => this.handleMouseLeave(item, image));

		});
		this.animate();
	}

	handleMouseEnter(item, image) {

		item.classList.add('is-active');
		// Show the image
		image.classList.add('is-visible');

		// Snap to position immediately
		this.moveImage(image, 0);
	}

	handleMouseLeave(item, image) {
		item.classList.remove('is-active');
		// image.classList.remove('is-visible');
		this.resetAllImages();
	}

	handleScroll () {

		const elementUnderMouse = document.elementFromPoint(Cursor.x, Cursor.y);
		// Hit Test
		const row = elementUnderMouse.closest('.work-list__item');

		if (row) {

			const image = row.querySelector('.work-list__preview');

			if (!row.classList.contains('is-active')) {
				this.resetAllImages();
				this.handleMouseEnter(row,image);
			}
		} else {
			this.resetAllImages();
		}
	}

	resetAllImages() {
		this.items.forEach(item => item.classList.remove('is-active'));
        document.querySelectorAll('.work-list__preview').forEach(img => {
            img.classList.remove('is-visible');
        });
    }

	animate() {

		// Apply Friction
		// this.vel.x *= 0.9;

		let rotation = Cursor.velX * 0.2;

		if (rotation > 15) rotation = 15;
		if (rotation < -15) rotation = -15;

		this.rotation += (rotation - this.rotation) * 0.1;

		const activeImage = document.querySelector('.work-list__preview.is-visible');
		if (activeImage) {
			this.moveImage(activeImage, this.rotation);
		}

		requestAnimationFrame(this.animate);

	}

	moveImage(image, rotation) {

		// Measure image
		const bounds = image.getBoundingClientRect();

		// Calculate Right of cursor
		let offsetX = Cursor.x + 20;
		let offsetY = Cursor.y + 20;

		// Boundary Check (Keep on screen)
		const screenWidth = window.innerWidth;
		if (offsetX + bounds.width > screenWidth) {
			offsetX = Cursor.x - bounds.width - 20;
		}

		image.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotation}deg)`;


	}

}
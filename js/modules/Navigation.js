// js/modules/Navigation.js

export default class Navigation {

	constructor() {

		// Selectors
		this.trigger = document.querySelector('.nav-trigger__btn');
		this.overlay = document.querySelector('.menu-overlay');

		if (!this.trigger || !this.overlay) return;

		this.toggle = this.toggle.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);

		this.init();
	}

	init() {

		this.trigger.addEventListener('click', this.toggle);

		const links = this.overlay.querySelectorAll('a');
		links.forEach(link => {
			link.addEventListener('click', () => this.close());
		});
	}

	toggle() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	open() {
		this.isOpen = true;

		this.overlay.classList.add('is-active');
		this.overlay.setAttribute('aria-hidden', 'false');

		this.trigger.innerText = 'CLOSE';
		this.trigger.setAttribute('aria-expanded', 'true');

		document.body.style.overflow = 'hidden';

		window.addEventListener('keydown', this.handleKeyDown);
	}

	close() {
		this.isOpen = false;

		this.overlay.classList.remove('is-active');
		this.overlay.setAttribute('aria-hidden', 'true');

		this.trigger.innerText = 'MENU';
		this.trigger.setAttribute('aria-expanded', 'false');

		document.body.style.overflow = '';

		window.removeEventListener('keydown', this.handleKeydown);
	}

	handleKeyDown(e) {
		if (e.key === 'Escape') {
			this.close();
		}
	}
}
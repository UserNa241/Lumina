// js/modules/FilterSystem.js

export default class FilterSystem {

	constructor( {onFilterChange} = {} ) {

		//1. Select Elements
		// EVENT DELEGATION
		this.track = document.querySelector('.filters');

		// Moving White Background
		this.glider = document.querySelector('.filter-glider');

		//List of Buttons
		this.buttons = document.querySelectorAll('.filter-btn');

		if (!this.track || !this.glider) return;

		// 2. BINDING
		this.handleClick = this.handleClick.bind(this);

		this.onFilterChange = onFilterChange;

		this.init();
	}

	init() {

		// 3. CLICK LISTENER
		this.track.addEventListener('click', this.handleClick);


		// 4. INITIAL SET
		const activeBtn = document.querySelector('.filter-btn[aria-pressed="true"]');

		if (activeBtn) {
			this.MoveGlider(activeBtn);
		}
	}

	handleClick(e) {
		// 5. IDENTIFY TARGET
		const clickedBtn = e.target.closest('.filter-btn');

		if (!clickedBtn) return;

		// 6.UPDATE STATE
		this.buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));

		clickedBtn.setAttribute('aria-pressed', 'true');

		this.MoveGlider(clickedBtn);

		// Get the value: "branding", "digital", or "all"
		const category = clickedBtn.dataset.filter;

		// Check if a callback was provided, then run it
		if (this.onFilterChange) {
			this.onFilterChange(category);
		}
	}

	MoveGlider(btn) {
		// 8. THE MATH
		// offsetLeft: Distance of button from the left edge of the parent (.filters)
		// offsetWidth: Total width of the button
		const leftPosition = btn.offsetLeft;
		const width = btn.offsetWidth;

		// 9. APPLY STYLES
		// We translate the X position (High Performance)
		this.glider.style.transform = `translateX(${leftPosition}px)`;

		// We stretch the width to match the text size
		this.glider.style.width = `${width}px`;
	}


}
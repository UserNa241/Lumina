// js/modules/CircuarText.js

export default class CircularText {

	constructor() {
		this.element = document.querySelector(".seal-text");

		if (!this.element) return;

		this.init();

	}

	init() {
		const text = this.element.textContent;

		console.log(text);

		this.element.innerHTML = ``;

		const degreePerChar = 360 / text.length;

		text.split('').forEach((letter,index) => {

			const span = document.createElement("span");

			span.innerText = letter;

			span.style.setProperty('--i', index);
			span.style.setProperty('--rot',degreePerChar + 'deg');

			this.element.appendChild(span);
		});

		console.log(`CircularText: Init ${text.length} chars`);
	}
}
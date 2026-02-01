/* js/modules/TextScramble.js */

export default class TextScramble {

	constructor() {
		this.targets = document.querySelectorAll('[data-scramble]');
		this.chars = '!<>-_\\/[]{}—=+*^?#_';

		this.targets.forEach(el => this.init(el));
	}

	init(el) {
		const originalText = el.innerText;

		// 1. SPLIT & WRAP WORDS
		// We split by spaces/newlines to find "Words".
		// We wrap them in <span class="word-lock">
		const words = originalText.split(/(\s+)/); // Keeps delimiters (spaces/newlines)

		let html = '';
		words.forEach(w => {
			if (w.match(/\s/)) {
				// Keep whitespace/newlines as is
				html += w;
			} else {
				// Wrap actual words
				html += `<span class="word-lock">${w}</span>`;
			}
		});

		el.innerHTML = html;

		// 2. MEASURE & LOCK WIDTHS
		// Now that they are in the DOM, we freeze their width.
		const spans = el.querySelectorAll('.word-lock');
		spans.forEach(span => {
			const w = span.offsetWidth;
			span.style.width = `${w}px`; // LOCK IT
			span.style.display = 'block';
			span.style.textAlign = 'left'; // Center letters inside the box
		});

		// 3. ANIMATE EACH WORD INDIVIDUALLY
		spans.forEach((span, index) => {
			// Stagger start times slightly per word
			const delay = index * 10;
			this.animateWord(span, delay);
		});
	}

	animateWord(el, delay) {
		const text = el.innerText;
		let frame = 0;
		const queue = text.split('').map(char => {
			const duration = Math.floor(Math.random() * 40) + 40;
			return { char, end: duration };
		});

		const maxFrame = Math.max(...queue.map(q => q.end));

		const loop = () => {
			// Apply Delay
			if (frame < delay) {
				frame++;
				requestAnimationFrame(loop);
				return;
			}

			// Adjust local frame count relative to delay
			const localFrame = frame - delay;
			let output = '';

			queue.forEach(item => {
				if (localFrame >= item.end) {
					output += item.char;
				} else {
					if (!item.random || localFrame % 5 === 0) {
						item.random = this.randomChar();
					}
					// Add 'dud' class for styling
					output += `<span class="dud">${item.random}</span>`;
				}
			});

			el.innerHTML = output;

			if (localFrame < maxFrame) {
				frame++;
				requestAnimationFrame(loop);
			}
		};

		loop();
	}

	randomChar() {
		return this.chars[Math.floor(Math.random() * this.chars.length)];
	}
}
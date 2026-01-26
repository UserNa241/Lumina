// js/modules/Cursor.js

export class Cursor {

	constructor() {

		// Data Source
		this.x = 0;
		this.y = 0;
		this.lastX = 0;
		this.lastY = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 0;

		this.handleMouseMove = this.handleMouseMove.bind(this);

		window.addEventListener('mousemove', this.handleMouseMove);

	}

	handleMouseMove(e) {
		//Save old position
		this.lastX = this.x;
		this.lastY = this.y;

		// Update New Position
		this.x = e.clientX;
		this.y = e.clientY;

		// Calculate Physics
		this.velX = this.x - this.lastX;
		this.velY = this.y - this.lastY;
		this.speed = Math.hypot(this.velX, this.velY);
	}

	getRelativePosition(element) {

			const rect = element.getBoundingClientRect();

		return {
			x: this.x - rect.left,
			y: this.y - rect.top,

			isOnElement: (
				this.x >= rect.left &&
				this.x <= rect.right &&
				this.y >= rect.top &&
				this.y <= rect.bottom
			)
		};
	}
}

const cursor = new Cursor();
export default cursor;
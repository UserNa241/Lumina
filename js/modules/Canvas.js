/* js/modules/Canvas.js */

import Cursor from './Cursor.js';

export default class Canvas {

	constructor({canvasId}) {

		// 1.Setup Elements
		this.canvas = document.getElementById(canvasId);

		// Safety Check
		if (!this.canvas) return;

		this.ctx = this.canvas.getContext('2d');

		// 2. Configuration
		this.particles = [];
		this.particlesCount = 300;

		this.interactionRadius = 200;
		this.mouse = null;

		// 3.Bind Methods
		this.resize = this.resize.bind(this);
		this.animate = this.animate.bind(this);

		this.init();
	}

	init() {
		// Set Canvas to full width
		this.resize();

		// Listen for window resize
		addEventListener('resize', this.resize);
		// window.addEventListener('scroll', this.handleScroll);
		this.starColor = this.getStarColor();
		this.watchTheme();

		// Start the loop
		this.animate();

	}

	watchTheme() {
	  // A) React to OS theme changes (prefers-color-scheme)
	  this._mq = window.matchMedia("(prefers-color-scheme: dark)");
	  this._mq.addEventListener("change", () => {
	    this.starColor = this.getStarColor();
	  });

	  // B) React to your own theme toggles (class or data-theme on <html>)
	  const root = document.documentElement;
	  this._mo = new MutationObserver(() => {
	    this.starColor = this.getStarColor();
	  });

	  this._mo.observe(root, {
	    attributes: true,
	    attributeFilter: ["class", "data-theme"]
	  });

	  // C) Optional: manual trigger if you ever want it
	  window.addEventListener("lumina:themechange", () => {
	    this.starColor = this.getStarColor();
	  });
	}

	handleScroll() {
		// Just a Trigger
	}


	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.createParticles();
	}

	getStarColor() {
		// Read the value of '--star-color' from the <html> element
		const styles = getComputedStyle(document.documentElement);
		const color = styles.getPropertyValue('--star-color').trim();
		return color; // Returns "255, 255, 255" or "0, 0, 0"
	}

	createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particlesCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }

	animate() {
		// Clear the screen
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		const starColor = this.starColor;

		const relative = Cursor.getRelativePosition(this.canvas);

		this.mouse = relative.isOnElement ? { x: relative.x, y: relative.y } : null;

		this.particles.forEach((particle) => {
			particle.update(this.canvas.width, this.canvas.height);
			particle.draw(this.ctx, starColor);
		});

		this.drawConnections(starColor);

		requestAnimationFrame(this.animate);
	}

	drawConnections(starColor) {
		// Compare each particle
		for (let i = 0; i < this.particles.length; i++) {

			const p1 = this.particles[i];

			// --- 1. CHECK MOUSE FIRST (Optimization) ---
			if (this.mouse) {
				const dx = p1.x - this.mouse.x;
				const dy = p1.y - this.mouse.y;
				const distance = Math.hypot(dx, dy);

				if (distance < this.interactionRadius) {
					const opacity = 1 - (distance / this.interactionRadius);
					this.ctx.beginPath();
					this.ctx.strokeStyle = `rgba(192, 132, 252, ${opacity})`;
					this.ctx.lineWidth = 1;
					this.ctx.moveTo(p1.x, p1.y);
					this.ctx.lineTo(this.mouse.x, this.mouse.y);
					this.ctx.stroke();
				}
			}

			// --- 2. CHECK NEIGHBORS ---
			for (let j = i + 1; j < this.particles.length; j++) {
				const p2 = this.particles[j];
				const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);

				if (distance < 150) {
					const opacity = 1 - (distance / 150);
					this.ctx.beginPath();
					this.ctx.strokeStyle = `rgba(${starColor}, ${opacity * 0.4})`;
					this.ctx.lineWidth = 0.5;
					this.ctx.moveTo(p1.x, p1.y);
					this.ctx.lineTo(p2.x, p2.y);
					this.ctx.stroke();
				}
			}
		}
	}

}

// Helper Class: A single star

class Particle {
	constructor(canvasWidth, canvasHeight) {

		// 1. Position: Random spots on screen
		this.x = Math.random() * canvasWidth;
		this.y = Math.random() * canvasHeight;

		// 2. Velocity: Random speed and direction
		this.vx = (Math.random() - 0.5) * 0.5;
		this.vy = (Math.random() - 0.5) * 0.5;

		// 3. Appearance
		this.size = Math.random() * 1.5 + 0.5;
	}

	// Moving the particle
	update(canvasWidth, canvasHeight) {
		this.x += this.vx;
		this.y += this.vy;

		//Bounce off edges
		if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
		if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;
	}

	draw(ctx, starColor) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fillStyle = `rgba(${starColor}, 1)`;
		ctx.fill();
	}

}

















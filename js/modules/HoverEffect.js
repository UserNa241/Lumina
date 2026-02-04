// js/modules/HoverEffect.js
import Cursor from "./Cursor.js";

export default class HoverEffect {
  constructor() {
    this.list = document.querySelector(".work-list__list");
    if (!this.list) return;

    this.rotation = 0;

    this.activeRow = null;
    this.activeImage = null;

    this.handleListOver = this.handleListOver.bind(this);
    this.handleListLeave = this.handleListLeave.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  init() {

	  if (window.innerWidth <= 768) return;

    this.list.addEventListener("mouseover", this.handleListOver);
    this.list.addEventListener("mouseleave", this.handleListLeave);

    window.addEventListener("scroll", this.handleScroll, { passive: true });

    this.animate();
  }

  handleListOver(e) {
    const row = e.target.closest(".work-list__item");
    if (!row) return;

    if (row === this.activeRow) return;

    const image = row.querySelector(".work-list__preview");
    if (!image) return;

    this.setActive(row, image);
  }

  handleListLeave() {
    this.clearActive();
  }

  handleScroll() {
    const el = document.elementFromPoint(Cursor.x, Cursor.y);
    const row = el?.closest?.(".work-list__item");

    if (!row) {
      this.clearActive();
      return;
    }

    if (row === this.activeRow) return;

    const image = row.querySelector(".work-list__preview");
    if (!image) return;

    this.setActive(row, image);
  }

  setActive(row, image) {
    this.clearActive();

    row.classList.add("is-active");
    image.classList.add("is-visible");

    this.activeRow = row;
    this.activeImage = image;

    this.moveImage(image, 0);
  }

  clearActive() {
    if (this.activeRow) this.activeRow.classList.remove("is-active");
    if (this.activeImage) this.activeImage.classList.remove("is-visible");

    this.activeRow = null;
    this.activeImage = null;
  }

  animate() {
    let rotation = Cursor.velX * 0.2;

    if (rotation > 15) rotation = 15;
    if (rotation < -15) rotation = -15;

    this.rotation += (rotation - this.rotation) * 0.1;

    if (this.activeImage) {
      this.moveImage(this.activeImage, this.rotation);
    }

    requestAnimationFrame(this.animate);
  }

  moveImage(image, rotation) {
    const bounds = image.getBoundingClientRect();

    let x = Cursor.x + 20;
    let y = Cursor.y + 20;

    const vw = window.innerWidth;
    if (x + bounds.width > vw) {
      x = Cursor.x - bounds.width - 20;
    }

    image.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
  }
}
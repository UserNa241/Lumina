// js/modules/CaseModal.js
export default class CaseModal {
  constructor({
    dialogId = "case-modal",
    gridId = "work-grid-content",
  } = {}) {
    this.dialog = document.getElementById(dialogId);
    this.grid = document.getElementById(gridId);

    if (!this.dialog || !this.grid) return;

    // Modal nodes
    this.img = this.dialog.querySelector(".case-modal__img");
    this.title = this.dialog.querySelector(".case-modal__title");
    this.year = this.dialog.querySelector(".case-modal__year");
    this.category = this.dialog.querySelector(".case-modal__category");

    // Track the last focused element so we can restore focus on close
    this.lastFocus = null;

    // Bind
    this.onGridClick = this.onGridClick.bind(this);
    this.onDialogClick = this.onDialogClick.bind(this);
    this.onDialogClose = this.onDialogClose.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.init();
  }

  init() {
    // Event delegation: one listener for all cards
    this.grid.addEventListener("click", this.onGridClick);

    // Click outside content (on dialog surface) closes it
    this.dialog.addEventListener("click", this.onDialogClick);

    // Restore focus when closed
    this.dialog.addEventListener("close", this.onDialogClose);

    // ESC close fallback (dialog usually does this automatically, but this is safe)
    window.addEventListener("keydown", this.onKeyDown);
  }

  onGridClick(e) {
    // Only open when clicking the image/media area (your requirement)
    const media = e.target.closest(".project-card__media");
    if (!media) return;

    const card = e.target.closest(".project-card");
    if (!card) return;

    // Stop link navigation
    const link = e.target.closest("a");
    if (link) e.preventDefault();

    // Save focus for restoration
    this.lastFocus = document.activeElement;

    // Extract info from the card DOM (no extra data attributes needed)
    const img = card.querySelector("img");
    const titleNode = card.querySelector(".project-card__title");
    const yearNode = card.querySelector(".project-card__year");
    const category = card.getAttribute("data-category") || "";

    // Populate modal
    const src = img?.getAttribute("src") || "";
    const alt = img?.getAttribute("alt") || "";
    const title = titleNode?.textContent?.trim() || alt || "Case Study";
    const year = yearNode?.textContent?.trim() || "";

    this.setContent({ src, alt, title, year, category });

    // Open modal
    this.open();
  }

  setContent({ src, alt, title, year, category }) {
    if (this.img) {
      this.img.src = src;
      this.img.alt = alt || title;
    }
    if (this.title) this.title.textContent = title;
    if (this.year) this.year.textContent = year;
    if (this.category) this.category.textContent = category;
  }

  open() {
    if (typeof this.dialog.showModal === "function") {
      if (!this.dialog.open) this.dialog.showModal();
    } else {
      // Fallback if <dialog> isn't supported: just toggle open attribute
      this.dialog.setAttribute("open", "");
    }

    // Move focus to the close button for keyboard users
    const closeBtn = this.dialog.querySelector(".case-modal__close");
    closeBtn?.focus();
  }

  close() {
    if (typeof this.dialog.close === "function") {
      this.dialog.close();
    } else {
      this.dialog.removeAttribute("open");
    }
  }

  onDialogClick(e) {
    // If user clicks the dialog itself (not inside inner content), close.
    // Because our dialog fills the viewport, clicking outside the panel/media
    // often registers on the dialog surface.
    if (e.target === this.dialog) this.close();
  }

  onDialogClose() {
    // Restore focus to where the user was
    if (this.lastFocus && typeof this.lastFocus.focus === "function") {
      this.lastFocus.focus();
    }
    this.lastFocus = null;
  }

  onKeyDown(e) {
    // ESC support (some browsers do it automatically, this is a safe fallback)
    if (e.key === "Escape" && this.dialog.open) {
      this.close();
    }
  }
}
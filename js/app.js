/* js/app.js */

import Canvas from './modules/Canvas.js';
import HoverEffect from './modules/HoverEffect.js';
import FilterSystem from './modules/FilterSystem.js';
import GridManager from './modules/GridManager.js';
import CaseModal from './modules/CaseModal.js';
import CircularText from './modules/CircularText.js';
import ScrollSync from './modules/ScrollSync.js';
import TextScramble from './modules/TextScramble.js';
import Navigation from './modules/Navigation.js';
import Manifesto from "./modules/Manifesto.js";
// ... other imports ...

document.addEventListener('DOMContentLoaded', () => {
    
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;

    // 1. ALWAYS RUN (Essential)
    new Navigation();
    new FilterSystem(); // Assuming this is needed for mobile grid too
    new TextScramble();
    new CaseModal();
    const gridManager = new GridManager();
    // Connect Filter to Grid
    new FilterSystem({
        onFilterChange: (cat) => gridManager.filter(cat)
    });
	new Manifesto();

	new CircularText(); // The rotating seal (Optional: keep if scaled down)

    // 2. DESKTOP ONLY (Heavy Visuals)
    if (!isMobile && !isTouch) {
        new Canvas({ canvasId: 'hero-canvas' });
        new HoverEffect(); // The list hover effect
		new ScrollSync();  // The horizontal timeline
    } else {
        console.log("Mobile Detected: Skipped Heavy Modules");
    }

    console.log('System Online');
});
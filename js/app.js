
/* js/app.js */

//1. Import the class
import Canvas from './modules/Canvas.js';
import HoverEffect from "./modules/HoverEffect.js";
import FilterSystem from './modules/FilterSystem.js';
document.addEventListener('DOMContentLoaded', () => {

    // 3. Initialize the Canvas Animation
    // We pass the ID of the canvas element we want to target
    new Canvas({ canvasId: 'hero-canvas' });
    new HoverEffect();
    new FilterSystem();

    console.log('System Online: Canvas Initialized');
    console.log('System Online: HoverEffect Initialized');
    console.log('System: Filters Initialized');
});



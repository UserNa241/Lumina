/* js/data/projects.js */

// 1) Text Data Ingredients
const CLIENTS = [
	"Nike", "Tesla", "Aesop", "Spotify", "Apple", "Google", "SpaceX",
	"Vogue", "Rolex", "Hermes", "Oura", "Sony", "NASA", "Polestar",
	"Acne Studios", "MoMA", "Unreal", "Riot Games"
];

const TYPES = [
	"Campaign", "Interface", "Experience", "Rebrand", "System",
	"Editorial", "Film", "Identity", "Exhibition", "Product"
];

const CATEGORIES = ["branding", "digital", "motion"];

// 2) Aspect presets (so heights vary like masonry)
const ASPECTS = [
	{w: 900, h: 1200}, // portrait
	{w: 1200, h: 900}, // landscape
	{w: 1000, h: 1000}, // square
	{w: 1000, h: 1400}, // tall portrait
	{w: 1400, h: 900}, // wide landscape
];

// 3) Image URL generator (Picsum)
function makeImageUrl({w, h}, seed) {
	return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// 4) The Generator Function
export const generateBatch = (count = 12, startID = 1) => {
	const batch = [];

	for (let i = 0; i < count; i++) {
		const CurrentID = startID + i;

		const client = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
		const type = TYPES[Math.floor(Math.random() * TYPES.length)];
		const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
		const year = Math.floor(Math.random() * (2024 - 2020 + 1)) + 2020;

		// Pick an aspect preset
		const aspect = ASPECTS[Math.floor(Math.random() * ASPECTS.length)];

		// Seed strategy:
		// A) Stable per project id (recommended for consistent testing)
		const seed = `lumina-${CurrentID}`;

		// If you want NEW random images every refresh, use instead:
		// const seed = `lumina-${CurrentID}-${Math.floor(Math.random() * 1e9)}`;

		const image = makeImageUrl(aspect, seed);

		batch.push({
			id: CurrentID,
			title: `${client} ${type}`,
			category,
			year,

			image,                 // URL string (same as before)
			imageWidth: aspect.w,  // NEW
			imageHeight: aspect.h, // NEW
		});
	}

	return batch;
};

export const generateProjects = (count) => generateBatch(count, 1);
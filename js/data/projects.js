/* js/data/projects.js */

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

const MIN_DIM = 900;
const MAX_DIM = 1400;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// random seed generator
function randSeed() {
  // crypto is best when available
  if (window.crypto?.getRandomValues) {
    const arr = new Uint32Array(2);
    window.crypto.getRandomValues(arr);
    return `${arr[0].toString(16)}${arr[1].toString(16)}`;
  }
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function makeImageUrl(seed, w, h) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export const generateBatch = (count = 12, startID = 1) => {
  const batch = [];

  for (let i = 0; i < count; i++) {
    const id = startID + i;

    const client = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const year = Math.floor(Math.random() * (2024 - 2020 + 1)) + 2020;

    const imageWidth = randInt(MIN_DIM, MAX_DIM);
    const imageHeight = randInt(MIN_DIM, MAX_DIM);

    // truly random per generation call
    const seed = `lumina-${randSeed()}`;
    const image = makeImageUrl(seed, imageWidth, imageHeight);

    batch.push({
      id,
      title: `${client} ${type}`,
      category,
      year,

      image,
      imageWidth,
      imageHeight,
    });
  }

  return batch;
};

export const generateProjects = (count) => generateBatch(count, 1);
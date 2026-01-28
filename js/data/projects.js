/* js/data/projects.js */

// 1. Text Data Ingredients
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

// 2. The Image Bank (20 Real URLs)
// A mix of Portrait (Tall) and Landscape (Wide) to test Masonry
const IMAGES = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop", // 1. Portrait (Model)
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop", // 2. Landscape (Abstract)
    "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1000&auto=format&fit=crop", // 3. Portrait (Tech)
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop", // 4. Square (Retro)
    "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop", // 5. Portrait (Fashion)
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop", // 7. Portrait (Art)
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop", // 8. Landscape (Fluid)
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop", // 9. Portrait (Red)
    "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=1000&auto=format&fit=crop", // 10. Landscape (Dark)
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop", // 11. Portrait (Text)
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop", // 12. Landscape (Cyber)
    "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop", // 13. Portrait (bw)
    "https://images.unsplash.com/photo-1535378437327-1e58aeeb6381?q=80&w=1000&auto=format&fit=crop", // 15. Portrait (Pink)
    "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1000&auto=format&fit=crop", // 16. Landscape (Glass)
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop", // 17. Portrait (Nature)
    "https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=1000&auto=format&fit=crop", // 18. Landscape (Hand)
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1000&auto=format&fit=crop", // 19. Portrait (Neon Red)
    "https://images.unsplash.com/photo-1550684847-75bdda21cc95?q=80&w=1000&auto=format&fit=crop"  // 20. Landscape (Code)
];


// 3. The Generator Function
export const generateBatch = (count = 12, startID = 1) => {

    const batch = [];

    for (let i= 0 ; i < count; i++) {

        // Calculate Current ID
        const CurrentID = startID + i;

        // Random Text
        const client = CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
        const type = TYPES[Math.floor(Math.random() * TYPES.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const year = Math.floor(Math.random() * (2024 - 2020 + 1)) + 2020;

        // Image Logic:
        // Cycles through the 20 URLs.
        const imgUrl = IMAGES[Math.floor(Math.random() * IMAGES.length)];

        batch.push({
            id: CurrentID,
            title: `${client} ${type}`,
            category: category,
            year: year,
            image: imgUrl
        });
    }

    return batch;
};

export const generateProjects = (count) => generateBatch(count, 1);
// js/data/gateway.js

const GATEWAY_DECK = [
    {
        title: "LUMINA INDEX",
        year: "Back Home \u2192",  // FIXED: Lowercase 'y'
        link: "index.html",
        image: "https://picsum.photos/1000/1000?random=1"
    },
    {
        title: "WE ARE LUMINA",
        year: "About Agency \u2192", // FIXED: Lowercase 'y'
        link: "about.html",
        image: "https://picsum.photos/1000/1000?random=2"
    },
    {
        title: "START PROJECT",
        year: "Contact Us \u2192",
        link: "contact.html",
        image: "https://picsum.photos/1000/1000?random=3"
    }
];

export const getGatewayCard = (currentID) => {

    // 1. Calculate Rotation
    // ID 50 / 50 = 1.   1 % 3 = 1.  (Index 1: Agency)
    // ID 100 / 50 = 2.  2 % 3 = 2.  (Index 2: Contact)
    // ID 150 / 50 = 3.  3 % 3 = 0.  (Index 0: Home)
    const rawStep = currentID / 50;
    const cycleIndex = rawStep % GATEWAY_DECK.length;

    // Safety check
    const safeIndex = Math.floor(cycleIndex);
    const content = GATEWAY_DECK[safeIndex] || GATEWAY_DECK[0];

    // Debugging (Check your console to see which one picked)
    console.log(`Gateway Generated at ID ${currentID}. Index: ${safeIndex} (${content.title})`);

    return {
        id: currentID,
        title: content.title,
        category: "gateway",
        year: content.year, // Now matches the array key
        image: content.image,
        imageWidth: 1000,
        imageHeight: 1000
    };
};
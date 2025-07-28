export const fishingLocations = {
    lake: {
        name: 'Serene Lake',
        description: 'Just off the main road, this lake is a popular spot for newcomers and visitors alike. Plenty of common fish abound here, but keep your eyes peeled for the lesser-seen lakefish!',
        minLevel: 1,
        color: 0x88ccee,
        fishTable: [
            { type: 'bass', weight: 30 },
            { type: 'trout', weight: 30 },
            { type: 'catfish', weight: 30 },
            { type: 'lakefish', weight: 10}
        ]
    },
    ocean: {
        name: 'Deep Ocean',
        description: 'Temporary description here',
        minLevel: 3,
        color: 0x3366aa,
        fishTable: [
            { type: 'tuna', weight: 50 },
            { type: 'mackerel', weight: 40 },
            { type: 'squid', weight: 10 }
        ]
    },
    swamp: {
        name: 'Misty Swamp',
        description: 'Temporary description here',
        minLevel: 5,
        color: 0x556644,
        fishTable: [
            { type: 'eel', weight: 40 },
            { type: 'mudfish', weight: 35 },
            { type: 'frog', weight: 25 }
        ]
    }
};

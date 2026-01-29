/**
 * GLOBAL STATE & CONSTANTS
 */
export let state = {
    lat: "",
    lon: "",
    userLimitDist: 15000,
    openNowOnly: true,
    blacklist: new Set(),
    history: []
};

export const forbiddenKeywords = [
    'hotel', 'inn', 'suites', 'market', 'wholesale', 
    'grocery', 'liquor', 'supermarket', 'convenience', 'fish market'
];

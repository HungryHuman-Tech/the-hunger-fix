/**
 * GLOBAL STATE & CONSTANTS
 */
export let state = {
    lat: "",
    lon: "",
    userLimitDist: 15000,
    openNowOnly: true,
    highRatedOnly: true, // Default to true
    minRating: 4.0,      // Default threshold
    blacklist: new Set(),
    history: []
};

export const forbiddenKeywords = ['hotel', 'inn', 'suites', 'market', 'wholesale', 'grocery', 'liquor', 'supermarket', 'convenience', 'fish market'];

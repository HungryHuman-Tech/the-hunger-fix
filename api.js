import { GOOGLE_API_KEY, cuisineMapping } from './config.js';
import { state, forbiddenKeywords } from './state.js';
/**
 * Fetches raw data from Google Places API
 */
export async function fetchNearbyPlaces(searchType, radius) {
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'X-Goog-Api-Key': GOOGLE_API_KEY, 
            'X-Goog-FieldMask': 'places.displayName,places.rating,places.googleMapsUri,places.id,places.currentOpeningHours' 
        },
        body: JSON.stringify({
            includedTypes: cuisineMapping[searchType],
            maxResultCount: 20,
            locationRestriction: { 
                circle: { center: { latitude: state.lat, longitude: state.lon }, radius: radius } 
            }
        })
    });
    return await response.json();
}

/**
 * FILTRATION & RANDOMIZATION
 * 1. Checks Blacklist & Forbidden Keywords
 * 2. Filters by Open Status
 * 3. Filters by Minimum Rating (The new 4+ star logic)
 * 4. Shuffles the survivors
 */
export function filterAndShuffle(places, openNowOnly, minRating) {
    let filtered = (places || []).filter(p => {
        const name = p.displayName.text.toLowerCase();
        const rating = p.rating || 0;
        const isForbidden = forbiddenKeywords.some(word => name.includes(word));
        
        // Ensure the spot isn't blacklisted, isn't a hotel, and meets rating bar
        return !state.blacklist.has(p.id) && !isForbidden && rating >= minRating;
    });

    if (openNowOnly) {
        filtered = filtered.filter(p => p.currentOpeningHours?.openNow === true);
    }

    // Fisher-Yates Shuffle for true randomness
    for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    return filtered;
}
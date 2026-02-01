import { state } from './state.js';
// Ensure the .js extension is present for browser modules
import { cuisineMapping } from './config.js'; 
import { searchEmojis, errorEmojis, searchJokes, errorJokes } from './jokes.js';
import { startFlicker, stopFlicker, transition, addToHistory } from './utils.js';
import { fetchNearbyPlaces, filterAndShuffle } from './api.js';

const container = document.getElementById('app-container');
const screen = document.getElementById('screen-content');

/**
 * SCREEN: Cuisine Selection
 * Setup with 4+ Star Toggle (Default: ON) and Open Now Toggle
 */
function showCuisineSelection() {
    transition(container, () => {
        screen.innerHTML = `
            <div class="filter-section">
                <div class="toggle-container">
                    <span class="dist-label">4+ Stars Only</span>
                    <label class="switch">
                        <input type="checkbox" id="highRatedCheck" ${state.highRatedOnly ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="toggle-container">
                    <span class="dist-label">Open Now</span>
                    <label class="switch">
                        <input type="checkbox" id="openNowCheck" ${state.openNowOnly ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <h1>Hungry for?</h1>
            <div class="cuisine-grid">
                ${Object.keys(cuisineMapping).map(opt => `
                    <button class="cuisine-btn" data-type="${opt}">${opt}</button>
                `).join("")}
            </div>
            <button class="shuffle-btn" id="surpriseBtn">🎲 Surprise Me</button>
        `;
        setupCuisineListeners();
    });
}

/**
 * Event Listeners for Cuisine Screen
 */
function setupCuisineListeners() {
    // Updates global state for ratings
    document.getElementById('highRatedCheck').onchange = (e) => {
        state.highRatedOnly = e.target.checked;
        state.minRating = e.target.checked ? 4.0 : 0;
    };

    // Updates global state for business hours
    document.getElementById('openNowCheck').onchange = (e) => {
        state.openNowOnly = e.target.checked;
    };

    // Maps each button to the startSearch function
    document.querySelectorAll('.cuisine-btn').forEach(b => {
        b.onclick = () => startSearch(b.dataset.type);
    });

    // Randomly selects a cuisine type from config.js
    document.getElementById('surpriseBtn').onclick = () => {
        const categories = Object.keys(cuisineMapping);
        const randomType = categories[Math.floor(Math.random() * categories.length)];
        startSearch(randomType);
    };
}

/**
 * CORE SEARCH LOGIC
 * Recursively checks radiuses: 5km -> 15km -> 25km -> 35km
 */
async function startSearch(type, currentTierIdx = null) {
    const tiers = [5000, 15000, 25000, 35000];
    if (currentTierIdx === null) currentTierIdx = 0;
    const currentDist = tiers[currentTierIdx];

    // Loading UI
    const joke = searchJokes[Math.floor(Math.random() * searchJokes.length)];
    const emoji = searchEmojis[Math.floor(Math.random() * searchEmojis.length)];
    
    screen.innerHTML = `
        <div class="loading-container">
            <div class="flicker-emoji">${emoji}</div>
            <div class="joke-text">${joke}</div>
        </div>
    `;
    startFlicker();

    try {
        const data = await fetchNearbyPlaces(type, currentDist);
        // Uses the minRating from state (4.0 by default)
        const placeList = filterAndShuffle(data.places, state.openNowOnly, state.minRating);

        if (placeList.length > 0) {
            stopFlicker();
            const place = placeList[0];
            const statusText = place.currentOpeningHours?.openNow ? "OPEN NOW" : "CLOSED";
            addToHistory(place, type);
            showVerdict(place, type, statusText);
        } else if (currentTierIdx < (tiers.length - 1)) {
            // Expand search radius
            return startSearch(type, currentTierIdx + 1);
        } else if (state.highRatedOnly && state.minRating >= 4.0) {
            // End of the line: No 4+ star restaurants found
            stopFlicker();
            showLowRatingPrompt(type);
        } else {
            // No results found at any rating
            stopFlicker();
            showError(errorJokes[Math.floor(Math.random() * errorJokes.length)]);
        }
    } catch (e) {
        stopFlicker();
        showError("The internet is hangry. Check your connection.");
    }
}

/**
 * FALLBACK PROMPT: Shown when 4-star search fails
 */
function showLowRatingPrompt(type) {
    transition(container, () => {
        screen.innerHTML = `
            <h1>SLIGHT PROBLEM</h1>
            <div class="joke-container">None of the restaurants above 4 stars are available nearby.</div>
            <p style="margin-bottom:20px;">Want to try lower rated restaurants?</p>
            <button id="lowerStandardsBtn" class="action-btn">YES, I'M DESPERATE</button>
            <button id="nevermindBtn" class="back-link">NO, I'LL STARVE</button>
        `;
        
        document.getElementById('lowerStandardsBtn').onclick = () => {
            state.minRating = 0; // Disable rating requirement for the retry
            startSearch(type);
        };
        
        document.getElementById('nevermindBtn').onclick = () => {
            state.minRating = 4.0; // Reset state
            showCuisineSelection();
        };
    });
}

/**
 * FINAL VERDICT SCREEN
 */
function showVerdict(place, type, statusText) {
    transition(container, () => {
        screen.innerHTML = `
            <div class="category-badge">${type.toUpperCase()}</div>
            <h1>${place.displayName.text}</h1>
            <p>Rating: ⭐ ${place.rating || 'New'}</p>
            <p class="status">${statusText}</p>
            <div class="action-row">
                <a href="${place.googleMapsUri}" target="_blank" class="action-btn">GO NOW</a>
                <button id="nextOptionBtn" class="action-btn secondary">NEXT OPTION</button>
            </div>
            <button id="backToCuisine" class="back-link">Try something else?</button>
        `;
        
        document.getElementById('nextOptionBtn').onclick = () => {
            state.blacklist.add(place.id);
            startSearch(type);
        };

        document.getElementById('backToCuisine').onclick = () => showCuisineSelection();
    });
}

/**
 * ERROR SCREEN
 */
function showError(msg) {
    const emoji = errorEmojis[Math.floor(Math.random() * errorEmojis.length)];
    transition(container, () => {
        screen.innerHTML = `
            <div class="flicker-emoji">${emoji}</div>
            <h1>SORRY!</h1>
            <div class="joke-container">${msg}</div>
            <button id="errorBackBtn" class="action-btn">TRY AGAIN</button>
        `;
        document.getElementById('errorBackBtn').onclick = () => showCuisineSelection();
    });
}

// Global Exports for HTML compatibility
window.showCuisineSelection = showCuisineSelection;
window.startSearch = startSearch;

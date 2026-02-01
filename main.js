import { GOOGLE_API_KEY, cuisineMapping } from './config.js';
import { searchEmojis, errorEmojis, searchJokes, errorJokes } from './jokes.js';
import { state } from './state.js';
import { startFlicker, stopFlicker, transition } from './utils.js';
import { fetchNearbyPlaces, filterAndShuffle } from './api.js';

// --- DOM ELEMENTS ---
const container = document.getElementById('app-container');
const screen = document.getElementById('screen-content');
const historyBtn = document.getElementById('history-btn');
const historyCount = document.getElementById('history-count');
const historyList = document.getElementById('history-list');
const historyPanel = document.getElementById('history-panel');

// --- UI RENDERING ---

function showCuisineSelection() {
    transition(container, () => {
        screen.innerHTML = `
            <div class="filter-section">
                <div class="dist-label">Max Distance</div>
                <div class="dist-toggle">
                    ${[5000, 15000, 25000, 35000].map(d => 
                        `<button class="dist-btn ${state.userLimitDist === d ? 'active' : ''}" data-dist="${d}">
                            ${d/1000}KM
                        </button>`
                    ).join('')}
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
            ${Object.keys(cuisineMapping).map(opt => `<button class="cuisine-btn" data-type="${opt}">${opt}</button>`).join("")}
            <button class="shuffle-btn" id="surpriseBtn">🎲 Surprise Me</button>
            <button class="back-link" onclick="location.reload()">Reset Address</button>
        `;
        setupCuisineListeners();
    });
}

function setupCuisineListeners() {
    document.querySelectorAll('.dist-btn').forEach(b => {
        b.onclick = () => { state.userLimitDist = parseInt(b.dataset.dist); showCuisineSelection(); };
    });
    document.getElementById('openNowCheck').onchange = (e) => { state.openNowOnly = e.target.checked; };
    document.querySelectorAll('.cuisine-btn').forEach(b => {
        b.onclick = () => startSearch(b.dataset.type);
    });
    document.getElementById('surpriseBtn').onclick = () => startSearch('Surprise');
}

// --- SEARCH LOGIC ---

async function startSearch(type, currentTierIdx = null) {
    const tiers = [5000, 15000, 25000, 35000];
    if (currentTierIdx === null) currentTierIdx = tiers.indexOf(state.userLimitDist);
    const currentDist = tiers[currentTierIdx];
    
    screen.innerHTML = `
        <div><span id="flicker-target" class="smiley-flicker">🍕</span></div>
        <div class="joke-container">"${searchJokes[Math.floor(Math.random() * searchJokes.length)]}"</div>
        <div class="status-pulse">Scanning ${currentDist/1000}KM...</div>
    `;
    startFlicker(searchEmojis);

    await new Promise(r => setTimeout(r, 2200)); 
    let searchType = type === 'Surprise' ? Object.keys(cuisineMapping)[Math.floor(Math.random() * 6)] : type;

    try {
        const data = await fetchNearbyPlaces(searchType, currentDist);
        const placeList = filterAndShuffle(data.places, state.openNowOnly);

        if (placeList.length > 0) {
            stopFlicker();
            const place = placeList[0];
            const statusText = place.currentOpeningHours?.openNow ? "OPEN NOW" : "CLOSED";
            
            addToHistory(place, searchType);
            showVerdict(place, searchType, statusText);
        } 
        else if (currentTierIdx < (tiers.length - 1)) {
            return startSearch(type, currentTierIdx + 1);
        } 
        else {
            stopFlicker();
            showError(errorJokes[Math.floor(Math.random() * errorJokes.length)]);
        }
    } catch (e) { 
        stopFlicker(); 
        showError("Network error. Your signal is hangry."); 
    }
}

// --- VERDICT & HISTORY ---

function showVerdict(place, type, statusText) {
    transition(container, () => {
        screen.innerHTML = `
            <h1>THE FIX</h1>
            <div class="spot-card">
                <div class="best-badge">${type}</div>
                <h2>${place.displayName.text}</h2>
                <p>Rating: ⭐ ${place.rating || 'New'}</p>
                <p style="font-weight: bold; color: ${statusText === 'OPEN NOW' ? '#28a745' : '#FF3B30'}">
                    ${statusText}
                </p>
                <a href="${place.googleMapsUri}" target="_blank" class="action-btn">LET'S GO</a>
            </div>
            <button id="keepLookingBtn" class="back-link">Keep Looking</button>
            <button id="changeCraveBtn" class="back-link" style="text-decoration:none;">← Change Craving</button>
        `;
        document.getElementById('keepLookingBtn').onclick = () => { state.blacklist.add(place.id); startSearch(type); };
        document.getElementById('changeCraveBtn').onclick = () => showCuisineSelection();
    });
}

function showError(msg) {
    transition(container, () => {
        screen.innerHTML = `
            <div><span id="flicker-target" class="smiley-flicker">💀</span></div>
            <h1>EMPTY PLATE</h1>
            <div class="joke-container">${msg}</div>
            <button id="tryAgainBtn">Try Again</button>
        `;
        startFlicker(errorEmojis);
        document.getElementById('tryAgainBtn').onclick = () => showCuisineSelection();
    });
}

function addToHistory(place, type) {
    if (state.history.find(h => h.id === place.id)) return;
    state.history.unshift({ ...place, category: type });
    if (state.history.length > 5) state.history.pop();
    
    historyBtn.style.display = 'flex';
    historyCount.innerText = state.history.length;
    
    historyList.innerHTML = state.history.map(h => `
        <div class="history-item">
            <div><h4 style="margin:0;">${h.displayName.text}</h4><small>${h.category}</small></div>
            <a href="${h.googleMapsUri}" target="_blank" style="text-decoration:none; font-size:1.4rem;">📍</a>
        </div>
    `).join('');
}

// --- INITIALIZERS ---

document.getElementById('findFoodBtn').onclick = () => { 
    if (!state.lat) return alert("Select location!"); 
    showCuisineSelection(); 
};

document.getElementById('locateMeBtn').onclick = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => { 
        state.lat = pos.coords.latitude; 
        state.lon = pos.coords.longitude; 
        document.getElementById('cityInput').value = "Your Current Location"; 
    });
};

historyBtn.onclick = () => { historyPanel.classList.toggle('open'); };
document.getElementById('closeHistoryBtn').onclick = () => { historyPanel.classList.remove('open'); };

// Nominatim Search Logic
let timeout;
document.getElementById('cityInput').oninput = (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const val = e.target.value;
        if(val.length < 3) return;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(val)}`);
        const data = await res.json();
        const list = document.getElementById('suggestions');
        list.innerHTML = "";
        if (data.length > 0) {
            list.style.display = 'block';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                const a = item.address;
                const label = [(a.house_number ? a.house_number + " " : "") + (a.road || ""), a.city || a.town || "", a.country || ""].filter(p => p.trim() !== "").join(", ");
                div.innerText = label;
                div.onclick = (ev) => { 
                    ev.stopPropagation(); 
                    document.getElementById('cityInput').value = label; 
                    state.lat = parseFloat(item.lat); 
                    state.lon = parseFloat(item.lon); 
                    list.style.display = 'none'; 
                };
                list.appendChild(div);
            });
        }
    }, 500);
};

document.addEventListener('click', (e) => {
    if (e.target.id !== 'suggestions' && e.target.id !== 'cityInput') {
        document.getElementById('suggestions').style.display = 'none';
    }
});

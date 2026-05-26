// ============================================================
// CONSTANTS
// ============================================================

const BASE_URL = 'http://localhost:5000/api/v1';

// Type colors — PokéAPI returns type names, we map them to colors
const TYPE_COLORS = {
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
    normal: '#A8A878',
};

// ============================================================
// DOM REFERENCES
// Getting these once at the top is more efficient than
// querying the DOM every time a function runs
// ============================================================

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const statusEl = document.getElementById('status');
const cardEl = document.getElementById('card');

// Add this at the top of app.js, outside all functions
let currentRequest = null;  // tracks the active request

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        statusEl.textContent = 'Please enter a Pokemon name or ID';
        statusEl.className = 'error';
        return;
    }

    // If a previous request is still running, cancel it
    if (currentRequest) {
        currentRequest.abort();
    }

    // Create a new AbortController for this request
    currentRequest = new AbortController();
    const { signal } = currentRequest;

    showLoading();

    try {
        const rawData = await fetchPokemon(query, signal);
        const pokemon = transformPokemon(rawData);
        showPokemon(pokemon);

    } catch (error) {
        // AbortError is thrown when we cancel — it's not a real error
        if (error.name === 'AbortError') return;
        showError(error.message);
    } finally {
        // Clean up regardless of success or failure
        currentRequest = null;
    }
}


// ============================================================
// API LAYER
// This function is ONLY responsible for fetching data.
// It knows nothing about the UI.
// This separation is called "separation of concerns".
// ============================================================

async function fetchPokemon(nameOrId, signal) {
  const response = await fetch(
    `${BASE_URL}/pokemon/${nameOrId.toLowerCase()}`,
    { signal }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Request failed');
  }
  const { data } = await response.json(); // unwrap our { success, data } envelope
  return data;
}


// ============================================================
// DATA TRANSFORMATION
// PokéAPI returns a LOT of data we don't need.
// This function extracts only what we care about.
// In production, always transform API responses at the boundary.
// ============================================================

function transformPokemon(backendData) {
    // backendData is already transformed by the backend service.
    // It has stats: [{ name: 'hp', value: 45 }, { name: 'attack', value: 49 }, ...]
    // Let's convert stats array to an object: { hp, attack, defense, speed }
    const statsObj = {};
    if (backendData && Array.isArray(backendData.stats)) {
        backendData.stats.forEach(s => {
            statsObj[s.name] = s.value;
        });
    }
    return {
        id: backendData.id,
        name: backendData.name,
        height: backendData.height,
        weight: backendData.weight,
        sprite: backendData.sprite,
        types: backendData.types,
        stats: {
            hp: statsObj.hp || 0,
            attack: statsObj.attack || 0,
            defense: statsObj.defense || 0,
            speed: statsObj.speed || 0,
        }
    };
}


// ============================================================
// UI LAYER
// These functions only touch the DOM.
// They receive data and render it — nothing else.
// ============================================================

function showLoading() {
    // Disable button to prevent multiple simultaneous requests
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching…';

    // Clear previous results
    cardEl.style.display = 'none';
    cardEl.innerHTML = '';

    // Show loading message
    statusEl.textContent = 'Fetching Pokemon data…';
    statusEl.className = '';  // clear error class if set previously
}

function showError(message) {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';

    statusEl.textContent = message;
    statusEl.className = 'error';

    cardEl.style.display = 'none';
}

function showPokemon(pokemon) {
    // Re-enable button
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
    statusEl.textContent = '';

    // Build type badges HTML
    const typesBadges = pokemon.types
        .map(type => {
            const color = TYPE_COLORS[type] || '#718096';
            return `<span class="type-badge" style="background:${color}">${type}</span>`;
        })
        .join('');

    // Build stats HTML
    const statsHTML = `
    <div class="stat">
      <div class="stat-name">HP</div>
      <div class="stat-value">${pokemon.stats.hp}</div>
    </div>
    <div class="stat">
      <div class="stat-name">Attack</div>
      <div class="stat-value">${pokemon.stats.attack}</div>
    </div>
    <div class="stat">
      <div class="stat-name">Defense</div>
      <div class="stat-value">${pokemon.stats.defense}</div>
    </div>
    <div class="stat">
      <div class="stat-name">Speed</div>
      <div class="stat-value">${pokemon.stats.speed}</div>
    </div>
  `;

    // Set card HTML
    cardEl.innerHTML = `
    <img 
      src="${pokemon.sprite}" 
      alt="${pokemon.name}"
      loading="lazy"
    />
    <h2>#${pokemon.id} — ${pokemon.name}</h2>
    <div class="types">${typesBadges}</div>
    <div class="stats">${statsHTML}</div>
    <div style="margin-top:16px; text-align:center; color:#718096; font-size:13px">
      ${pokemon.height}m · ${pokemon.weight}kg
    </div>
  `;

    // Reveal the card
    cardEl.style.display = 'block';
}




// ============================================================
// EVENT LISTENERS
// Wire up user interactions to the controller
// ============================================================

// Button click
searchBtn.addEventListener('click', handleSearch);

// Enter key in input
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Focus the input on page load — better UX
searchInput.focus();

// Debounce utility — reusable for any function
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        // Every call clears the previous timer
        clearTimeout(timer);
        // Start a new timer — only fires if no more calls come in before delay
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Create a debounced version of handleSearch
// 400ms delay — fires 400ms after the user stops typing
const debouncedSearch = debounce(handleSearch, 400);

// Wire up to input — fires on every keystroke, but debounce limits actual searches
searchInput.addEventListener('input', debouncedSearch);

// ============================================================
// CONSTANTS
// ============================================================

const BASE_URL = 'http://localhost:5000/api/v1';

const TYPE_COLORS = {
  fire:     '#F08030', water:    '#6890F0', grass:    '#78C850',
  electric: '#F8D030', psychic:  '#F85888', ice:      '#98D8D8',
  dragon:   '#7038F8', dark:     '#705848', fairy:    '#EE99AC',
  fighting: '#C03028', flying:   '#A890F0', poison:   '#A040A0',
  ground:   '#E0C068', rock:     '#B8A038', bug:      '#A8B820',
  ghost:    '#705898', steel:    '#B8B8D0', normal:   '#A8A878',
};

// How to color each stat bar
const STAT_COLORS = {
  hp:               '#ff6b6b',
  attack:           '#ffa94d',
  defense:          '#74c0fc',
  'special-attack': '#da77f2',
  'special-defense':'#63e6be',
  speed:            '#f9f871',
};

// Human-readable stat name map
const STAT_LABELS = {
  hp:               'HP',
  attack:           'Attack',
  defense:          'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense':'Sp. Defense',
  speed:            'Speed',
};

// ============================================================
// STATE
// ============================================================

let currentRequest = null;
let currentPokemon = null;     // full detail object
let currentSprite  = 'normal'; // 'normal' | 'shiny'
let flavorIndex    = 0;        // which flavor text entry we're showing

// ============================================================
// DOM REFS
// ============================================================

const searchInput = document.getElementById('search-input');
const searchBtn   = document.getElementById('search-btn');
const statusEl    = document.getElementById('status');
const cardEl      = document.getElementById('card');

// ============================================================
// API LAYER — calls our backend, not PokéAPI directly
// ============================================================

async function fetchPokemonDetail(nameOrId, signal) {
  const res = await fetch(
    `${BASE_URL}/pokemon/${encodeURIComponent(nameOrId.toLowerCase())}/detail`,
    { signal }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Request failed (${res.status})`);
  }

  const { data } = await res.json();
  return data;
}

// ============================================================
// CONTROLLER — orchestrates fetch → render
// ============================================================

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    setStatus('Please enter a Pokémon name or ID', 'error');
    return;
  }

  // Cancel any in-flight request
  if (currentRequest) currentRequest.abort();
  currentRequest = new AbortController();

  showLoading();

  try {
    const detail = await fetchPokemonDetail(query, currentRequest.signal);
    currentPokemon = detail;
    flavorIndex    = 0;
    currentSprite  = 'normal';
    renderCard(detail);
  } catch (err) {
    if (err.name === 'AbortError') return;
    showError(err.message);
  } finally {
    currentRequest = null;
  }
}

// ============================================================
// RENDER — each function renders one section of the card
// ============================================================

function renderCard(p) {
  // Restore button
  searchBtn.disabled  = false;
  searchBtn.textContent = 'Search';
  setStatus('');

  renderHero(p);
  renderStats(p);
  renderAbilities(p);
  renderFlavor(p);
  renderInfo(p);
  renderHeldItems(p);

  cardEl.style.display = 'block';
  // re-trigger animation
  cardEl.style.animation = 'none';
  void cardEl.offsetWidth;
  cardEl.style.animation = '';
}

// ── Hero section ────────────────────────────────────────────

function renderHero(p) {
  // Gradient background derived from primary type color
  const primaryColor = TYPE_COLORS[p.types[0]] || '#4a4a6a';
  const heroEl = document.getElementById('hero-section');
  heroEl.style.setProperty('--type-gradient',
    `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.18)} 0%, #1a1a24 60%)`
  );

  // Sprites
  const img = document.getElementById('pokemon-img');
  img.src = p.sprites.officialArt || p.sprites.default || '';
  img.alt = p.name;

  // Shiny toggle wiring
  document.getElementById('btn-default').onclick = () => switchSprite('normal', p);
  document.getElementById('btn-shiny').onclick   = () => switchSprite('shiny', p);

  // Number & name
  document.getElementById('pokemon-number').textContent = `#${String(p.id).padStart(3,'0')}`;
  document.getElementById('pokemon-name').textContent   = capitalize(p.name);
  document.getElementById('pokemon-genus').textContent  = p.genus || '';

  // Type badges
  document.getElementById('pokemon-types').innerHTML = p.types
    .map(t => `<span class="type-badge" style="background:${TYPE_COLORS[t]||'#718096'}">${t}</span>`)
    .join('');

  // Meta grid — height, weight, capture rate, happiness
  document.getElementById('pokemon-meta').innerHTML = `
    <div class="meta-item">
      <div class="meta-label">Height</div>
      <div class="meta-value">${p.height} m</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Weight</div>
      <div class="meta-value">${p.weight} kg</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Capture Rate</div>
      <div class="meta-value">${p.captureRate ?? '—'}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Base Happiness</div>
      <div class="meta-value">${p.baseHappiness ?? '—'}</div>
    </div>
  `;

  // Special badges (legendary, mythical, baby, generation)
  const badges = [];
  if (p.isLegendary) badges.push(`<span class="badge badge-legendary">Legendary</span>`);
  if (p.isMythical)  badges.push(`<span class="badge badge-mythical">Mythical</span>`);
  if (p.isBaby)      badges.push(`<span class="badge badge-baby">Baby</span>`);
  if (p.generation)  badges.push(`<span class="badge badge-gen">${formatGeneration(p.generation)}</span>`);
  document.getElementById('pokemon-badges').innerHTML = badges.join('');
}

function switchSprite(mode, p) {
  currentSprite = mode;
  const img = document.getElementById('pokemon-img');

  // Fade transition
  img.style.opacity = '0';
  setTimeout(() => {
    if (mode === 'shiny') {
      img.src = p.sprites.shinyArt || p.sprites.shiny || p.sprites.officialArt || '';
    } else {
      img.src = p.sprites.officialArt || p.sprites.default || '';
    }
    img.style.opacity = '1';
  }, 150);

  document.getElementById('btn-default').classList.toggle('active', mode === 'normal');
  document.getElementById('btn-shiny').classList.toggle('active',   mode === 'shiny');
}

// ── Stats section ────────────────────────────────────────────

function renderStats(p) {
  const maxStat = 255; // theoretical max in PokéAPI

  const rows = p.stats.map(s => {
    const color  = STAT_COLORS[s.name] || '#a0a0c0';
    const label  = STAT_LABELS[s.name] || s.name;
    const pct    = Math.round((s.value / maxStat) * 100);

    return `
      <div class="stat-row">
        <div class="stat-name">${label}</div>
        <div class="stat-val">${s.value}</div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill"
               style="width:${pct}%; background:${color}">
          </div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('body-stats').innerHTML = `
    <div class="stat-list">
      ${rows}
      <div class="stat-total-row">
        <span class="stat-total-label">Base Stat Total</span>
        <span class="stat-total-val">${p.statTotal}</span>
      </div>
    </div>
  `;
}

// ── Abilities section ─────────────────────────────────────────

function renderAbilities(p) {
  const primaryColor = TYPE_COLORS[p.types[0]] || '#4a4a6a';

  const items = p.abilities.map(a => `
    <div class="ability-item">
      <div class="ability-dot" style="background:${a.isHidden ? 'var(--accent)' : primaryColor}"></div>
      <span class="ability-name">${a.name.replace(/-/g, ' ')}</span>
      ${a.isHidden ? '<span class="ability-hidden-tag">Hidden</span>' : ''}
    </div>
  `).join('');

  document.getElementById('body-abilities').innerHTML =
    `<div class="ability-list">${items}</div>`;
}

// ── Flavor text section ───────────────────────────────────────

function renderFlavor(p) {
  const texts = p.flavorTexts || [];
  if (!texts.length) {
    document.getElementById('body-flavor').innerHTML =
      '<p class="empty-state">No Pokédex entries available.</p>';
    return;
  }

  function drawFlavor() {
    const prevBtn = document.getElementById('flavor-prev');
    const nextBtn = document.getElementById('flavor-next');
    document.getElementById('flavor-text').textContent = texts[flavorIndex];
    document.getElementById('flavor-count').textContent =
      `${flavorIndex + 1} / ${texts.length}`;
    if (prevBtn) prevBtn.disabled = flavorIndex === 0;
    if (nextBtn) nextBtn.disabled = flavorIndex === texts.length - 1;
  }

  document.getElementById('body-flavor').innerHTML = `
    <p class="flavor-text" id="flavor-text"></p>
    <div class="flavor-nav">
      <button id="flavor-prev" onclick="prevFlavor()">‹</button>
      <span class="flavor-counter" id="flavor-count"></span>
      <button id="flavor-next" onclick="nextFlavor()">›</button>
    </div>
  `;

  drawFlavor();
}

function prevFlavor() {
  if (flavorIndex > 0) {
    flavorIndex--;
    renderFlavor(currentPokemon);
  }
}

function nextFlavor() {
  const texts = currentPokemon?.flavorTexts || [];
  if (flavorIndex < texts.length - 1) {
    flavorIndex++;
    renderFlavor(currentPokemon);
  }
}

// ── Training & Breeding section ───────────────────────────────

function renderInfo(p) {
  const eggGroups = (p.eggGroups || []).join(', ') || '—';
  const forms     = (p.forms     || []).join(', ') || '—';

  document.getElementById('body-info').innerHTML = `
    <div class="info-grid">
      <div class="info-cell">
        <div class="info-label">Growth Rate</div>
        <div class="info-value">${(p.growthRate || '—').replace(/-/g,' ')}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Egg Groups</div>
        <div class="info-value">${eggGroups}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Base EXP</div>
        <div class="info-value">${p.baseExperience ?? '—'}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Habitat</div>
        <div class="info-value">${(p.habitat || '—').replace(/-/g,' ')}</div>
      </div>
      <div class="info-cell" style="grid-column:span 2">
        <div class="info-label">Forms</div>
        <div class="info-value">${forms}</div>
      </div>
    </div>
  `;
}

// ── Held Items section ────────────────────────────────────────

function renderHeldItems(p) {
  const items = p.heldItems || [];
  if (!items.length) {
    document.getElementById('body-items').innerHTML =
      '<p class="empty-state">This Pokémon does not hold any wild items.</p>';
    return;
  }

  const chips = items.map(item =>
    `<span class="held-item-chip">${item.name.replace(/-/g,' ')}</span>`
  ).join('');

  document.getElementById('body-items').innerHTML =
    `<div class="held-items-list">${chips}</div>`;
}

// ============================================================
// PANEL ACCORDION
// ============================================================

function togglePanel(id) {
  const header  = document.querySelector(`#panel-${id} .panel-header`);
  const body    = document.getElementById(`body-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);

  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
  chevron.classList.toggle('open', !isOpen);
}

// ============================================================
// UI UTILITIES
// ============================================================

function showLoading() {
  searchBtn.disabled    = true;
  searchBtn.textContent = 'Searching…';
  cardEl.style.display  = 'none';
  setStatus('Fetching Pokémon data…');
}

function showError(msg) {
  searchBtn.disabled    = false;
  searchBtn.textContent = 'Search';
  cardEl.style.display  = 'none';
  setStatus(msg, 'error');
}

function setStatus(msg, cls = '') {
  statusEl.textContent = msg;
  statusEl.className   = cls;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function formatGeneration(gen) {
  // "generation-i" → "Gen I"
  return gen ? 'Gen ' + gen.replace('generation-', '').toUpperCase() : '';
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ============================================================
// DEBOUNCE
// ============================================================

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ============================================================
// EVENT WIRING
// ============================================================

searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

searchInput.addEventListener('input', debounce(handleSearch, 450));

searchInput.focus();

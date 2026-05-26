// src/services/pokemon.service.js
// All PokéAPI communication and data transformation lives here
// No req/res objects ever appear in this file

const POKEAPI_BASE  = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';

// Simple in-memory cache
// Key: pokemon name/id, Value: { data, cachedAt }
// In Phase 4 we'll replace this with Redis
const cache = new Map();
const CACHE_TTL_MS  = (parseInt(process.env.CACHE_TTL_MINUTES) || 10) * 60 * 1000;

function isCacheValid(entry) {
  return Date.now() - entry.cachedAt < CACHE_TTL_MS;
}

// ── Transform functions ────────────────────────────────────

function transformPokemon(raw) {
  return {
    id:      raw.id,
    name:    raw.name,
    height:  raw.height / 10,    // decimetres → metres
    weight:  raw.weight / 10,    // hectograms → kg
    sprite:  raw.sprites.other['official-artwork'].front_default
             || raw.sprites.front_default,
    types:   raw.types.map(t => t.type.name),
    abilities: raw.abilities.map(a => ({
      name:     a.ability.name,
      isHidden: a.is_hidden
    })),
    stats:   raw.stats.map(s => ({
      name:  s.stat.name,
      value: s.base_stat
    })),
    baseExperience: raw.base_experience
  };
}

function transformPokemonList(raw) {
  // PokéAPI list response: { count, next, previous, results: [{name, url}] }
  return {
    count:    raw.count,
    next:     raw.next,
    previous: raw.previous,
    results:  raw.results.map(p => ({
      name: p.name,
      // Extract ID from the URL: ".../pokemon/25/" → 25
      id: parseInt(p.url.split('/').filter(Boolean).pop())
    }))
  };
}

// ── Service functions ──────────────────────────────────────

async function getPokemonByName(name) {
  const cacheKey = `pokemon:${name.toLowerCase()}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached.data;
  }
  console.log(`Cache MISS: ${cacheKey}`);

  const response = await fetch(
    `${POKEAPI_BASE}/pokemon/${name.toLowerCase()}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      // Throw a structured error — controller will handle the HTTP response
      const err = new Error(`Pokemon "${name}" not found`);
      err.statusCode = 404;
      throw err;
    }
    const err = new Error('PokéAPI request failed');
    err.statusCode = 502; // Bad Gateway — upstream service failed
    throw err;
  }

  const raw = await response.json();
  const data = transformPokemon(raw);

  // Store in cache
  cache.set(cacheKey, { data, cachedAt: Date.now() });

  return data;
}

async function getPokemonList({ limit = 20, offset = 0 } = {}) {
  const safeLimit  = Math.min(Math.max(parseInt(limit)  || 20, 1), 100);
  const safeOffset = Math.max(parseInt(offset) || 0, 0);
  const cacheKey   = `list:${safeLimit}:${safeOffset}`;

  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached.data;
  }
  console.log(`Cache MISS: ${cacheKey}`);

  const response = await fetch(
    `${POKEAPI_BASE}/pokemon?limit=${safeLimit}&offset=${safeOffset}`
  );
  if (!response.ok) {
    const err = new Error('Failed to fetch Pokemon list');
    err.statusCode = 502;
    throw err;
  }

  const raw = await response.json();

  // Build rich pagination metadata — clients should never have to compute this
  const data = {
    pagination: {
      total:       raw.count,
      limit:       safeLimit,
      offset:      safeOffset,
      currentPage: Math.floor(safeOffset / safeLimit) + 1,
      totalPages:  Math.ceil(raw.count / safeLimit),
      hasNext:     safeOffset + safeLimit < raw.count,
      hasPrev:     safeOffset > 0,
      // HATEOAS: give clients ready-to-use URLs so they never build URLs themselves
      links: {
        self:  `/api/v1/pokemon?limit=${safeLimit}&offset=${safeOffset}`,
        next:  safeOffset + safeLimit < raw.count
               ? `/api/v1/pokemon?limit=${safeLimit}&offset=${safeOffset + safeLimit}`
               : null,
        prev:  safeOffset > 0
               ? `/api/v1/pokemon?limit=${safeLimit}&offset=${Math.max(0, safeOffset - safeLimit)}`
               : null,
        first: `/api/v1/pokemon?limit=${safeLimit}&offset=0`,
        last:  `/api/v1/pokemon?limit=${safeLimit}&offset=${(Math.ceil(raw.count / safeLimit) - 1) * safeLimit}`
      }
    },
    results: raw.results.map(p => ({
      name: p.name,
      id:   parseInt(p.url.split('/').filter(Boolean).pop())
    }))
  };

  cache.set(cacheKey, { data, cachedAt: Date.now() });
  return data;
}

async function getPokemonByType(typeName) {
  const cacheKey = `type:${typeName.toLowerCase()}`;

  const cached = cache.get(cacheKey);
  if (cached && isCacheValid(cached)) return cached.data;

  const response = await fetch(
    `${POKEAPI_BASE}/type/${typeName.toLowerCase()}`
  );

  if (!response.ok) {
    const err = new Error(`Type "${typeName}" not found`);
    err.statusCode = response.status === 404 ? 404 : 502;
    throw err;
  }

  const raw = await response.json();

  // Type endpoint returns Pokemon in that type
  const data = {
    type:    raw.name,
    count:   raw.pokemon.length,
    pokemon: raw.pokemon.map(p => ({
      name: p.pokemon.name,
      id:   parseInt(p.pokemon.url.split('/').filter(Boolean).pop())
    }))
  };

  cache.set(cacheKey, { data, cachedAt: Date.now() });
  return data;
}

module.exports = {
  getPokemonByName,
  getPokemonList,
  getPokemonByType
};

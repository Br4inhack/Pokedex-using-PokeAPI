// src/services/pokemon.detail.service.js
// Handles the "rich detail" response for a single Pokémon.
// This is a separate service from pokemon.service.js intentionally —
// detail fetching has different caching TTL, error concerns, and complexity.

const cache   = require('../utils/cache');
const pokeapi = require('../api/pokeapi.client');
const { transformPokemonDetail } = require('../utils/transform/pokemon.transform');

// Cache detail responses longer — species/habitat data changes rarely
const DETAIL_CACHE_PREFIX = 'detail:';

async function getPokemonDetail(nameOrId) {
  const key = `${DETAIL_CACHE_PREFIX}${String(nameOrId).toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  // ── Parallel API calls ─────────────────────────────────
  // Fetch pokemon and species data simultaneously.
  // Promise.all() runs both requests in parallel — not sequentially.
  // Sequential would be: ~600ms. Parallel: ~300ms (limited by slowest).
  // ALWAYS use Promise.all() when requests are independent of each other.
  const [rawPokemon, rawSpecies] = await Promise.all([
    pokeapi.fetchPokemon(nameOrId),
    pokeapi.fetchPokemonSpecies(nameOrId),
  ]);

  const data = transformPokemonDetail(rawPokemon, rawSpecies);

  cache.set(key, data);
  return data;
}

module.exports = { getPokemonDetail };

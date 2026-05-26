// src/services/pokemon.service.js
// Handles basic Pokemon operations: list, single lookup, by type.
// Rich detail (species, evolution) lives in pokemon.detail.service.js

const cache  = require('../utils/cache');
const pokeapi = require('../api/pokeapi.client');

// ── Transforms ─────────────────────────────────────────────

function transformPokemon(raw) {
  return {
    id:             raw.id,
    name:           raw.name,
    height:         raw.height / 10,
    weight:         raw.weight / 10,
    sprite:         raw.sprites.other['official-artwork'].front_default
                    || raw.sprites.front_default,
    types:          raw.types.map(t => t.type.name),
    abilities:      raw.abilities.map(a => ({
      name:     a.ability.name,
      isHidden: a.is_hidden,
    })),
    stats:          raw.stats.map(s => ({
      name:  s.stat.name,
      value: s.base_stat,
    })),
    baseExperience: raw.base_experience,
  };
}

// ── Service functions ──────────────────────────────────────

async function getPokemonByName(name) {
  const key = `pokemon:${name.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const raw  = await pokeapi.fetchPokemon(name);
  const data = transformPokemon(raw);

  cache.set(key, data);
  return data;
}

async function getPokemonList({ limit = 20, offset = 0 } = {}) {
  const safeLimit  = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const safeOffset = Math.max(parseInt(offset) || 0, 0);
  const key        = `list:${safeLimit}:${safeOffset}`;

  const hit = cache.get(key);
  if (hit) return hit;

  const raw  = await pokeapi.fetchPokemonList(safeLimit, safeOffset);

  const data = {
    pagination: {
      total:       raw.count,
      limit:       safeLimit,
      offset:      safeOffset,
      currentPage: Math.floor(safeOffset / safeLimit) + 1,
      totalPages:  Math.ceil(raw.count / safeLimit),
      hasNext:     safeOffset + safeLimit < raw.count,
      hasPrev:     safeOffset > 0,
      links: {
        self:  `/api/v1/pokemon?limit=${safeLimit}&offset=${safeOffset}`,
        next:  safeOffset + safeLimit < raw.count
               ? `/api/v1/pokemon?limit=${safeLimit}&offset=${safeOffset + safeLimit}`
               : null,
        prev:  safeOffset > 0
               ? `/api/v1/pokemon?limit=${safeLimit}&offset=${Math.max(0, safeOffset - safeLimit)}`
               : null,
        first: `/api/v1/pokemon?limit=${safeLimit}&offset=0`,
        last:  `/api/v1/pokemon?limit=${safeLimit}&offset=${(Math.ceil(raw.count / safeLimit) - 1) * safeLimit}`,
      },
    },
    results: raw.results.map(p => ({
      name: p.name,
      id:   parseInt(p.url.split('/').filter(Boolean).pop()),
    })),
  };

  cache.set(key, data);
  return data;
}

async function getPokemonByType(typeName) {
  const key = `type:${typeName.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const raw  = await pokeapi.fetchType(typeName);

  const data = {
    type:    raw.name,
    count:   raw.pokemon.length,
    pokemon: raw.pokemon.map(p => ({
      name: p.pokemon.name,
      id:   parseInt(p.pokemon.url.split('/').filter(Boolean).pop()),
    })),
  };

  cache.set(key, data);
  return data;
}

module.exports = { getPokemonByName, getPokemonList, getPokemonByType };

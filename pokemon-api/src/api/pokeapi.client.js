// src/api/pokeapi.client.js
// All raw HTTP calls to PokéAPI live here.
// Services import named functions from this module — they never call fetch() directly.
// This is the "Anti-Corruption Layer" pattern: isolates your app from external API quirks.

const config = require('../config');

const BASE = config.pokeapi.baseUrl;

// Generic fetch wrapper — normalises PokéAPI errors into structured app errors
async function pokeGet(path) {
  const url = `${BASE}${path}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    // Network-level error (DNS failure, timeout, etc.)
    const error = new Error('Unable to reach PokéAPI — network error');
    error.statusCode = 503;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? `Resource not found: ${path}`
        : `PokéAPI responded with status ${response.status}`
    );
    error.statusCode = response.status === 404 ? 404 : 502;
    throw error;
  }

  return response.json();
}

// ── Named resource fetchers ────────────────────────────────
// Each function has a single responsibility

const fetchPokemon = (nameOrId) =>
  pokeGet(`/pokemon/${String(nameOrId).toLowerCase()}`);

const fetchPokemonSpecies = (nameOrId) =>
  pokeGet(`/pokemon-species/${String(nameOrId).toLowerCase()}`);

const fetchEvolutionChain = (id) =>
  pokeGet(`/evolution-chain/${id}`);

const fetchType = (typeName) =>
  pokeGet(`/type/${typeName.toLowerCase()}`);

const fetchAbility = (abilityName) =>
  pokeGet(`/ability/${abilityName.toLowerCase()}`);

const fetchGeneration = (genId) =>
  pokeGet(`/generation/${genId}`);

const fetchPokemonList = (limit, offset) =>
  pokeGet(`/pokemon?limit=${limit}&offset=${offset}`);

module.exports = {
  fetchPokemon,
  fetchPokemonSpecies,
  fetchEvolutionChain,
  fetchType,
  fetchAbility,
  fetchGeneration,
  fetchPokemonList,
};

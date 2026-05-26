const asyncHandler    = require('../utils/asyncHandler');
const pokemonService  = require('../services/pokemon.service');
const detailService   = require('../services/pokemon.detail.service');

const getOnePokemon = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const pokemon = await pokemonService.getPokemonByName(name);
  res.json({ success: true, data: pokemon });
});

// Rich detail endpoint — aggregates multiple PokéAPI responses
const getPokemonDetail = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const detail = await detailService.getPokemonDetail(name);
  res.json({ success: true, data: detail });
});

const listPokemon = asyncHandler(async (req, res) => {
  const { limit, offset } = req.query;
  const result = await pokemonService.getPokemonList({ limit, offset });
  res.json({ success: true, data: result });
});

const getPokemonByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const result = await pokemonService.getPokemonByType(type);
  res.json({ success: true, data: result });
});

module.exports = { getOnePokemon, getPokemonDetail, listPokemon, getPokemonByType };
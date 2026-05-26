const asyncHandler = require('../utils/asyncHandler');
const pokemonService = require('../services/pokemon.service');

// No try/catch needed — asyncHandler catches it automatically
const getOnePokemon = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const pokemon = await pokemonService.getPokemonByName(name);
  res.json({ success: true, data: pokemon });
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

module.exports = { getOnePokemon, listPokemon, getPokemonByType };
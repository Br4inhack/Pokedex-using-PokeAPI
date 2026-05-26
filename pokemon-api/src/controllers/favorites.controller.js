const asyncHandler      = require('../utils/asyncHandler');
const favoritesService  = require('../services/favorites.service');

const listFavorites = asyncHandler(async (req, res) => {
  // req.user.userId comes from the JWT — injected by requireAuth middleware
  const result = favoritesService.listFavorites(req.user.userId);
  res.json({ success: true, data: result });
});

const addFavorite = asyncHandler(async (req, res) => {
  const result = favoritesService.addFavorite(
    req.user.userId,
    req.params.pokemonName
  );
  res.status(201).json({ success: true, data: result });
});

const removeFavorite = asyncHandler(async (req, res) => {
  favoritesService.removeFavorite(req.user.userId, req.params.pokemonName);
  res.status(204).send(); // 204 No Content — no body
});

module.exports = { listFavorites, addFavorite, removeFavorite };

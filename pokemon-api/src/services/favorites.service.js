// src/services/favorites.service.js
// Each user has their own favorites list, keyed by userId

const favorites = new Map(); // userId → Set of pokemon names

function getUserFavorites(userId) {
  if (!favorites.has(userId)) favorites.set(userId, new Set());
  return favorites.get(userId);
}

function addFavorite(userId, pokemonName) {
  const userFavs = getUserFavorites(userId);

  if (userFavs.has(pokemonName)) {
    const err = new Error(`${pokemonName} is already in your favorites`);
    err.statusCode = 409;
    throw err;
  }

  userFavs.add(pokemonName);
  return { pokemonName, addedAt: new Date().toISOString() };
}

function removeFavorite(userId, pokemonName) {
  const userFavs = getUserFavorites(userId);

  if (!userFavs.has(pokemonName)) {
    const err = new Error(`${pokemonName} is not in your favorites`);
    err.statusCode = 404;
    throw err;
  }

  userFavs.delete(pokemonName);
  // 204 No Content — no body needed for successful delete
}

function listFavorites(userId) {
  const userFavs = getUserFavorites(userId);
  return {
    count:    userFavs.size,
    pokemon:  Array.from(userFavs)
  };
}

function isFavorite(userId, pokemonName) {
  return getUserFavorites(userId).has(pokemonName);
}

module.exports = { addFavorite, removeFavorite, listFavorites, isFavorite };

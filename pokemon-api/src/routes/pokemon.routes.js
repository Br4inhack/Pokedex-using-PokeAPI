const express     = require('express');
const router      = express.Router();
const controller  = require('../controllers/pokemon.controller');
const validate    = require('../middleware/validate');
const {
  listPokemonSchema,
  getPokemonSchema,
  typeSchema
} = require('../validators/pokemon.validators');

// GET /api/v1/pokemon                 — paginated list
router.get('/',
  validate(listPokemonSchema),
  controller.listPokemon
);

// GET /api/v1/pokemon/type/:type      — filter by type
// IMPORTANT: specific routes before wildcard /:name
router.get('/type/:type',
  validate(typeSchema),
  controller.getPokemonByType
);

// GET /api/v1/pokemon/:name/detail    — rich detail (species, sprites, flavor)
// Also before /:name to avoid wildcard capture
router.get('/:name/detail',
  validate(getPokemonSchema),
  controller.getPokemonDetail
);

// GET /api/v1/pokemon/:name           — basic single pokemon
router.get('/:name',
  validate(getPokemonSchema),
  controller.getOnePokemon
);

module.exports = router;

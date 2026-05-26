// src/routes/pokemon.routes.js — with validation
const express     = require('express');
const router      = express.Router();
const controller  = require('../controllers/pokemon.controller');
const validate    = require('../middleware/validate');
const {
  listPokemonSchema,
  getPokemonSchema,
  typeSchema
} = require('../validators/pokemon.validators');

router.get('/',
  validate(listPokemonSchema),  // ← validates before controller runs
  controller.listPokemon
);

router.get('/type/:type',
  validate(typeSchema),
  controller.getPokemonByType
);

router.get('/:name',
  validate(getPokemonSchema),
  controller.getOnePokemon
);

module.exports = router;

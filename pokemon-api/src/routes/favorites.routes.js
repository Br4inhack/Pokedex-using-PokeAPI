const express      = require('express');
const router       = express.Router();
const Joi          = require('joi');
const validate     = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const ctrl         = require('../controllers/favorites.controller');

// ALL favorites routes require authentication
// Apply requireAuth once at the router level — cleaner than per-route
router.use(requireAuth);

const pokemonNameSchema = {
  params: Joi.object({
    pokemonName: Joi.string().pattern(/^[a-z0-9-]+$/).required()
  })
};

router.get  ('/',                                     ctrl.listFavorites);
router.post ('/:pokemonName', validate(pokemonNameSchema), ctrl.addFavorite);
router.delete('/:pokemonName', validate(pokemonNameSchema), ctrl.removeFavorite);

module.exports = router;

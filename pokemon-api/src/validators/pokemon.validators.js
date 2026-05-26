// src/validators/pokemon.validators.js
// Joi schemas for Pokemon-related requests

const Joi = require('joi');

const listPokemonSchema = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0)
  })
};

const getPokemonSchema = {
  params: Joi.object({
    // Name must be lowercase letters/hyphens, OR a numeric ID
    name: Joi.string()
      .pattern(/^[a-z0-9-]+$/)
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.pattern.base': 'Pokemon name must contain only lowercase letters, numbers, or hyphens'
      })
  })
};

const typeSchema = {
  params: Joi.object({
    type: Joi.string()
      .valid(
        'normal','fire','water','grass','electric','ice',
        'fighting','poison','ground','flying','psychic',
        'bug','rock','ghost','dragon','dark','steel','fairy'
      )
      .required()
      .messages({
        'any.only': 'Invalid Pokemon type. Must be one of the 18 types.'
      })
  })
};

module.exports = { listPokemonSchema, getPokemonSchema, typeSchema };

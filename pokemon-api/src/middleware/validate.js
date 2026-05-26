// src/middleware/validate.js
// Reusable validation middleware factory
// Usage: router.get('/', validate(schema), controller)

const Joi = require('joi');

// Factory function: takes a Joi schema, returns Express middleware
function validate(schema) {
  return (req, res, next) => {
    // Validate query params, body, and params in one shot
    const toValidate = {};
    if (schema.query)  toValidate.query  = req.query;
    if (schema.body)   toValidate.body   = req.body;
    if (schema.params) toValidate.params = req.params;

    const { error, value } = Joi.object(schema).validate(toValidate, {
      abortEarly: false,  // collect ALL errors, not just the first
      stripUnknown: true  // remove fields not in the schema
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          // Map Joi's error details to clean messages
          details: error.details.map(d => ({
            field:   d.path.join('.'),
            message: d.message.replace(/['"]/g, '')
          }))
        }
      });
    }

    // Replace req properties with validated + coerced values
    // Joi can coerce "20" (string) to 20 (number) if you tell it to
    if (value.query)  req.query  = value.query;
    if (value.body)   req.body   = value.body;
    if (value.params) req.params = value.params;

    next();
  };
}

module.exports = validate;

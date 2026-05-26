const express    = require('express');
const router     = express.Router();
const Joi        = require('joi');
const validate   = require('../middleware/validate');
const authCtrl   = require('../controllers/auth.controller');

const registerSchema = {
  body: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().min(2).max(30).required()
  })
};

const loginSchema = {
  body: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required()
  })
};

router.post('/register', validate(registerSchema), authCtrl.register);
router.post('/login',    validate(loginSchema),    authCtrl.login);
router.get('/me',        require('../middleware/auth').requireAuth, authCtrl.getMe);

module.exports = router;

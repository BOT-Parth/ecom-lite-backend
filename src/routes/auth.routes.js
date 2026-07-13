const express = require('express');
const AuthController = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const authenticate = require('../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/profile', authenticate, AuthController.getProfile);

module.exports = router;

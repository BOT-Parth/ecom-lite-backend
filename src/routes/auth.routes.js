/**
 * Layer:      Routes
 *
 * Purpose:
 * Registers authentication endpoints: register, login, and profile.
 * Applies validation middleware before register and login handlers.
 * Applies authentication middleware before the profile handler.
 *
 * Called By:
 * src/routes/index.js  (mounted at /auth)
 *
 * Calls:
 * src/middleware/validation.middleware.js   (validate)
 * src/middleware/auth.middleware.js         (authenticate)
 * src/validators/auth.validator.js
 * src/controllers/auth.controller.js
 *
 * Request Flow:
 * Client
 *   → routes/index.js
 *   → auth.routes.js
 *   → [validate] / [authenticate]
 *   → auth.controller.js
 *   → auth.service.js
 *   → user.repository.js
 *   → Prisma → PostgreSQL
 */

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

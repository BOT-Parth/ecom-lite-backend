const AuthService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/async');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const user = await AuthService.register(req.body);
    return sendSuccess(res, 'User registered successfully', { user }, 201);
  });

  login = asyncHandler(async (req, res) => {
    const data = await AuthService.login(req.body);
    return sendSuccess(res, 'User logged in successfully', data, 200);
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await AuthService.getProfile(req.user.userId);
    return sendSuccess(
      res,
      'User profile retrieved successfully',
      { user },
      200
    );
  });
}

module.exports = new AuthController();

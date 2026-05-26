const asyncHandler  = require('../utils/asyncHandler');
const authService   = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  // 201 Created for new resource
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

const getMe = asyncHandler(async (req, res) => {
  // req.user was attached by requireAuth middleware
  const user = authService.getUserById(req.user.userId);
  if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' }});
  res.json({ success: true, data: { user } });
});

module.exports = { register, login, getMe };

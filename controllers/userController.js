import asyncHandler from '../middleware/asyncHandler.js';

/**
 * @desc    Auth user & get token
 * @route   POST /api/users/auth
 * @access  Public
 */
const authUser = asyncHandler(async (req, res) => {
  res.json('Auth user & get token');
});

/**
 * @desc    Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  res.json('Register a new user');
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/users/logout
 * @access  Public
 */
const logoutUser = (req, res) => {
  res.json('Logout user');
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  res.json('Get user profile');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  res.json('Update user profile');
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  res.json('Get all users');
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  res.json('Delete user');
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  res.json('Get user by ID');
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  res.json('Update user');
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};

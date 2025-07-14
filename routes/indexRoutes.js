const express = require('express');
const router = express.Router();

// Controller for handling index routes
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

router.get('/', AuthController.isLoggedIn);
router.get('/login', AuthController.displayLoginPage);
router.post('/login', AuthController.handleLogin);
router.get('/logout', AuthController.handleLogout);
router.post('/logout', AuthController.handleLogout);
router.get('/register', AuthController.displayRegisterPage);
router.post('/register', AuthController.handleRegister);

// Profile route
router.get('/profile', UserController.displayMyProfile); // Redirects to current user's profile
router.post('/delete-account', UserController.deleteAccount); // Delete user account

// Route to search for users
router.get('/search-users', UserController.searchUsers);

// Route for technicians to delete any user
router.post('/delete-user/:email', UserController.deleteUserByTechnician);

// Route for technicians to update any user 
router.post('/update-user/:email', UserController.updateUserByTechnician);

module.exports = router;
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

// Route for technicians adn admins to delete users
router.post('/delete-user/:email', UserController.deleteUser);

// Route for technicians and admins to update users 
router.post('/update-user/:email', UserController.updateUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const { userController } = require('../controllers/users-controller');

// Authentication routes
router.get('/register', userController.showRegister);
router.post('/register', userController.handleRegister);
router.get('/login', userController.showLogin);
router.post('/login', userController.handleLogin);
router.get('/profile', userController.showProfile);
router.post('/logout', userController.handleLogout);

module.exports = router;

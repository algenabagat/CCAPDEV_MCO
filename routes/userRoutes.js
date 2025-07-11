const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Route to display a user's profile by email
router.get('/profile/:email', UserController.displayProfilePage);
router.get('/profile', UserController.displayMyProfile); // Route to display the current user's own profile
router.put('/profile/:email', UserController.updateProfile);

// Route to display the search users page
router.post('/profile/:email', UserController.updateProfile);

module.exports = router;
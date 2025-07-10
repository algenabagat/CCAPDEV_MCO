const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Route to display a user's profile by email
router.get('/profile/:email', UserController.displayProfilePage);
router.get('/profile', UserController.displayMyProfile); // Route to display the current user's own profile
router.put('/profile/:email', UserController.updateProfile);

//router.get('/search-users', UserController.searchUsers);
// Route to display the search users page

module.exports = router;
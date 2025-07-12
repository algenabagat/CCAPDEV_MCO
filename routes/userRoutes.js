const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Route to display a user's profile by email
router.get('/:email', UserController.displayProfilePage);
router.get('/:email', UserController.displayMyProfile); // Route to display the current user's own profile
router.put('/:email', UserController.updateProfile);

// Route to display the search users page
router.post('/:email', UserController.updateProfile);

module.exports = router;
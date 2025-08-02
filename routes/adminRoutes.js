const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// Check if user is Admin
router.use(AdminController.checkAdminRole);

// Display admin page
router.get('/', AdminController.displayAdminPage);

// Update role
router.post('/update-role', AdminController.updateUserRole);

// Delete user
router.delete('/delete-user/:userId', AdminController.deleteUser);

module.exports = router; 
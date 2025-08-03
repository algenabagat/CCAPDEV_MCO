const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

router.use(AdminController.checkAdminRole);
router.get('/', AdminController.displayAdminPage);
router.post('/update-role', AdminController.updateUserRole);
router.delete('/delete-user/:userId', AdminController.deleteUser);

module.exports = router; 
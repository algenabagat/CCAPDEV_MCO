const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Show all reservations
router.get('/', reservationController.getAllReservations);

// ✅ Handle deletion
router.post('/delete/:id', reservationController.deleteReservation);

// ✅ Handle update
router.post('/update/:id', reservationController.updateReservation);

module.exports = router;

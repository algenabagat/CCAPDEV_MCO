const express = require('express');
const router = express.Router();

const ResController = require('../controllers/ResController');
const AuthController = require('../controllers/AuthController');

// Student reservation routes
router.get('/create-reservation', AuthController.requireAuth, ResController.checkStudentRole, ResController.showCreateReservation);
router.post('/create-reservation', AuthController.requireAuth, ResController.checkStudentRole, ResController.handleCreateReservation);

// Technician reservation routes
router.get('/create-reservation-tech', AuthController.requireAuth, ResController.checkTechnicianRole, ResController.showCreateReservationTech);
router.post('/create-reservation-tech', AuthController.requireAuth, ResController.checkTechnicianRole, ResController.handleCreateReservationTech);

// Search slots routes
router.post('/search-slots', AuthController.requireAuth, ResController.handleSearchSlots);
router.get('/search-slots', AuthController.requireAuth,ResController.showSearchSlots);
router.get('/view-slots', AuthController.requireAuth, ResController.showViewSlots);
router.post('/check-slots', ResController.checkAvailableSlots);

// Edit reservation routes
router.get('/edit/:id', AuthController.requireAuth, ResController.checkStudentRole, ResController.showEditReservation);
router.post('/edit/:id', AuthController.requireAuth, ResController.checkStudentRole, ResController.handleEditReservation);

// Delete reservation route
router.delete('/delete/:id', AuthController.requireAuth, ResController.checkTechnicianRole, ResController.deleteReservation);

// My Reservations route
router.get('/my-reservations', AuthController.requireAuth, ResController.showMyReservations);

module.exports = router;
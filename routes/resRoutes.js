const express = require('express');
const router = express.Router();

const ResController = require('../controllers/ResController');
const AuthController = require('../controllers/AuthController');

// Student reservation routes
router.get('/create-reservation', 
  AuthController.requireAuth, 
  ResController.checkStudentRole,
  ResController.showCreateReservation
);

router.post('/create-reservation', 
  AuthController.requireAuth,
  ResController.checkStudentRole,
  ResController.handleCreateReservation
);

// Technician reservation routes
router.get('/create-reservation-tech', 
  AuthController.requireAuth,
  ResController.checkTechnicianRole,
  ResController.showCreateReservationTech
);

router.post('/create-reservation-tech', 
  AuthController.requireAuth,
  ResController.checkTechnicianRole,
  ResController.handleCreateReservationTech
);

router.post('/search-slots', 
  AuthController.requireAuth, 
  ResController.handleSearchSlots

);

router.get('/search-slots',
  AuthController.requireAuth,
  ResController.showSearchSlots
);

router.get('/view-slots',
  AuthController.requireAuth,
  ResController.showViewSlots
);

router.post('/check-slots', 
  ResController.checkAvailableSlots
);


// View/edit reservations routes
// router.get('/my-reservations',
//   AuthController.requireAuth,
//   ResController.viewMyReservations
// );

// Edit reservation by ID (show form)
router.get('/edit/:id',
  AuthController.requireAuth,
  ResController.checkStudentRole,
  ResController.showEditReservation
);

// Edit reservation by ID (submit update)
router.post('/edit/:id',
  AuthController.requireAuth,
  ResController.checkStudentRole,
  ResController.handleEditReservation
);

// Technician: Delete reservation by ID
router.delete('/delete/:id',
  AuthController.requireAuth,
  ResController.checkTechnicianRole,
  ResController.deleteReservation
);

// // Admin reservation management
// router.post('/cancel/:id',
//   AuthController.requireAuth,
//   ResController.checkTechnicianRole,
//   ResController.cancelReservation
// );

// My Reservations page for logged-in user
router.get('/my-reservations',
  AuthController.requireAuth, 
  ResController.showMyReservations
);

module.exports = router;
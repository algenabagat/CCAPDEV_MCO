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

// router.get('/edit/:id',
//   AuthController.requireAuth,
//   ResController.showEditReservation
// );

// router.post('/edit/:id',
//   AuthController.requireAuth,
//   ResController.handleEditReservation
// );

// // Admin reservation management
// router.post('/cancel/:id',
//   AuthController.requireAuth,
//   ResController.checkTechnicianRole,
//   ResController.cancelReservation
// );

module.exports = router;
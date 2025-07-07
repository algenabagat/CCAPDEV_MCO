const express = require('express');
const router = express.Router();

// Controller for handling index routes
const AuthController = require('../controllers/AuthController');

router.get('/', AuthController.isLoggedIn);


router.get('/login', AuthController.displayLoginPage);
router.post('/login', AuthController.handleLogin);
router.get('/logout', AuthController.handleLogout);
router.post('/logout', AuthController.handleLogout);


// In any route file:
router.get('/profile', (req, res) => {
  if (!req.user) return res.redirect('/login'); // Simple guard
  res.render('profile', { user: req.user });
});

// Routes for reservation

// Routes for profile

// Routes for search
router.get('/search-users', (req, res) => {
    res.render('search-users', {
        title: 'Search Users',
        additionalCSS: ['/css/search.css'],
        additionalJS: ['/js/search-users.js']
    });
});


router.get('/search-slots', (req, res) => {
    res.render('search-slots', {
        title: 'Search Slots',
        additionalCSS: ['/css/search.css'],
        additionalJS: ['/js/search.js']
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
// Controller for handling index routes

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login', {
        additionalCSS: ['/css/login.css'],
        additionalJS: ['/js/login.js']
    });
});

router.post('/logout', (req, res) => {
  res.render('logout', {
    additionalCSS: ['/css/logout.css'],
    additionalJS: ['/js/logout.js']
  });
  //res.redirect('/login');
});

// Routes for reservation

// Routes for profile

// Routes for search
module.exports = router;

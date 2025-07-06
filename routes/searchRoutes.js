const express = require('express');
const router = express.Router();

// Import controller for handling search routes

router.get('/search-users', (req, res) => {
    res.render('search-users', {
        additionalCSS: ['/css/search.css'],
        additionalJS: ['/js/search.js']
    });
});


router.get('/search-slots', (req, res) => {
    res.render('search-slots', {
        additionalCSS: ['/css/search.css'],
        additionalJS: ['/js/search.js']
    });
});

module.exports = router;
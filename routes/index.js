const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('index', { 
        title: 'Lab Reservation System',
        user: req.session.user 
    });
});

module.exports = router;

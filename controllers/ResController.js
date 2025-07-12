const User = require('../models/Users');
const Laboratory = require('../models/Laboratories');
const Reservation = require('../models/Reservations');

// Middleware to check if user is a student
exports.checkStudentRole = async (req, res, next) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Only students can access this feature'
            });
        }
        next();
    } catch (err) {
        console.error('Role check error:', err);
        res.redirect('/');
    }
};

// Middleware to check if user is a technician
exports.checkTechnicianRole = async (req, res, next) => {
    try {
        if (req.user.role !== 'Technician') {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'Only lab technicians can access this feature'
            });
        }
        next();
    } catch (err) {
        console.error('Role check error:', err);
        res.redirect('/');
    }
};

// Show create reservation page for students
exports.showCreateReservation = async (req, res) => {
    try {
        const laboratories = await Laboratory.find({ isActive: true });
        
        res.render('create-reservation', {
            title: 'Create Reservation',
            currentUser: req.user,
            laboratories: laboratories,
            currentLab: laboratories[0], // Default to first lab
            additionalCSS: ['/css/seats.css', '/css/slotregis.css'],
            additionalJS: ['/js/createResStud.js']
        });
    } catch (err) {
        console.error('Error showing reservation page:', err);
        res.redirect('/');
    }
};

// Handle student reservation creation
exports.handleCreateReservation = async (req, res) => {
    try {
        const { seatNumbers, labId, timeSlots, isAnonymous } = req.body;
        const userId = req.user._id;

        // Create reservation logic here
        // ...

        res.redirect('/profile?success=Reservation created successfully');
    } catch (err) {
        console.error('Reservation error:', err);
        res.redirect('/create-reservation?error=Failed to create reservation');
    }
};

// Show create reservation page for technicians
exports.showCreateReservationTech = async (req, res) => {
    try {
        const laboratories = await Laboratory.find({ isActive: true });
        const students = await User.find({ role: 'Student', isDeleted: false });
        
        res.render('create-reservation-tech', {
            title: 'Create Reservation (Tech)',
            currentUser: req.user,
            laboratories: laboratories,
            students: students,
            currentLab: laboratories[0], // Default to first lab
            additionalCSS: ['/css/seats.css', '/css/slotregis.css'],
            additionalJS: ['/js/createResTech.js']
        });
    } catch (err) {
        console.error('Error showing tech reservation page:', err);
        res.redirect('/');
    }
};

// Handle technician reservation creation
exports.handleCreateReservationTech = async (req, res) => {
    try {
        const { seatNumbers, labId, timeSlots, studentEmail, isAnonymous } = req.body;
        const technicianId = req.user._id;

        // Create reservation logic here
        // ...

        res.redirect('/profile?success=Reservation created successfully');
    } catch (err) {
        console.error('Tech reservation error:', err);
        res.redirect('/create-reservation-tech?error=Failed to create reservation');
    }
};
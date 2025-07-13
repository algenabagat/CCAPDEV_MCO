const User = require('../models/Users');
const Laboratory = require('../models/Laboratories');
const Slot = require('../models/Slots');
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

// Show search slots page
exports.showSearchSlots = async (req, res) => {
    try {
        const labs = (await Laboratory.find({ isActive: true }));
        const laboratories = labs.map(lab => ({
            _id: lab._id,
            name: lab.name,
            description: lab.description,
            capacity: lab.capacity,
            location: lab.location,
            isActive: lab.isActive
        }));
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 7); // Next 7 days as per specs
        
        res.render('search-slots', {
            title: 'Search Available Slots',
            currentUser: req.user,
            laboratories: laboratories,
            today: today,
            maxDate: maxDate,
            additionalCSS: ['/css/search.css'],
            additionalJS: ['/js/search-slots.js']
        });
    } catch (err) {
        console.error('Error showing search slots page:', err);
        res.redirect('/');
    }
};
// Handle slot search with real-time data
exports.handleSearchSlots = async (req, res) => {
    try {
        const { labId, date } = req.body;
        
        if (!labId || !date) {
            return res.status(400).json({ error: 'Missing labId or date' });
        }

        const laboratory = await Laboratory.findById(labId);
        if (!laboratory) {
            return res.status(404).json({ error: 'Laboratory not found' });
        }

        // Convert and normalize date
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const slots = await Slot.find({
            laboratory: labId,
            date: { $gte: selectedDate, $lte: endDate }
        })
        .populate({
            path: 'timeSlots.reservedBy',
            select: 'name email profilePicture'
        })
        .populate({
            path: 'timeSlots.blockedBy',
            select: 'name'
        });

        const results = {
            labName: laboratory.name,
            labId: laboratory._id,
            date: date,
            lastUpdated: new Date(),
            seats: []
        };

        for (let seatNum = 1; seatNum <= laboratory.capacity; seatNum++) {
            const seatData = {
                seatNumber: seatNum,
                timeSlots: []
            };

            const seatSlots = slots.filter(s => s.seatNumber === seatNum);
            
            if (seatSlots.length > 0) {
                seatSlots.forEach(slot => {
                    slot.timeSlots.forEach(timeSlot => {
                        seatData.timeSlots.push({
                            id: timeSlot._id,
                            startTime: timeSlot.startTime,
                            endTime: timeSlot.endTime,
                            status: timeSlot.status,
                            reservedBy: timeSlot.reservedBy,
                            blockedBy: timeSlot.blockedBy,
                            reservationId: timeSlot.reservation
                        });
                    });
                });
            } else {
                // Generate default slots if none exist
                for (let hour = 8; hour < 18; hour++) {
                    seatData.timeSlots.push({
                        startTime: `${hour}:00`,
                        endTime: `${hour}:30`,
                        status: 'Available'
                    });
                    seatData.timeSlots.push({
                        startTime: `${hour}:30`,
                        endTime: `${hour+1}:00`,
                        status: 'Available'
                    });
                }
            }

            results.seats.push(seatData);
        }

        res.json(results);
    } catch (err) {
        console.error('Slot search error:', err.message, err.stack);
        res.status(500).json({ 
            error: 'Failed to search slots',
            details: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};
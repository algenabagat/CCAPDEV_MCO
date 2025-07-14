const User = require('../models/Users');
const Laboratory = require('../models/Laboratories');
const Reservation = require('../models/Reservations');
const Reservations = require('../models/Reservations');

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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 6);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

    // Generate time options from 08:00 to 17:30 in 30-minute intervals
    const timeOptions = [];
    for (let h = 8; h <= 17; h++) {
      for (let m of [0, 30]) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        timeOptions.push(`${hour}:${minute}`);
      }
    }

    const labs = await Laboratory.find({ isActive: true }).lean();
    const seatData = {};
    const selectedStartTime = new Date(req.query.startTime || `${todayStr}T08:00`);
    const selectedEndTime = new Date(selectedStartTime.getTime() + 30 * 60 * 1000);

    for (const lab of labs) {
      const reservations = await Reservation.find({
        laboratory: lab._id,
        startTime: { $lt: selectedEndTime },
        endTime: { $gt: selectedStartTime }
      }).lean();

      const reservedSeats = new Set();
      reservations.forEach(res => {
        res.seats.forEach(s => reservedSeats.add(s.seatNumber));
      });

      seatData[lab.name] = [];
      const maxSeat = lab.capacity || 0;

      for (let i = 1; i <= maxSeat; i++) {
        const reserved = reservedSeats.has(i);
        seatData[lab.name].push({
          occupied: reserved,
          user: reserved ? { name: req.user.firstName + ' ' + req.user.lastName, anonymous: res.isAnonymous } : null
        });
      }
    }

    res.render('create-reservation', {
      title: 'Create Reservation',
      currentUser: req.user,
      labs,
      currentLab: labs[0],
      seatData: JSON.stringify(seatData),
      today: todayStr,
      sevenDaysLater: sevenDaysLaterStr,
      timeOptions,
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
    const { labName, seatIndices, reservationDate, reservationTime, isAnonymous } = req.body;

    console.log('Creating reservation with data:', {
      labName,
      seatIndices,
      reservationDate,
      reservationTime,
      isAnonymous
    });

    // Validate input
    if (
      !labName ||
      !Array.isArray(seatIndices) ||
      seatIndices.length === 0 ||
      !reservationDate ||
      !reservationTime
    ) {
      return res.status(400).json({ success: false, message: 'Missing reservation data.' });
    }

    const userId = req.user._id;
    const lab = await Laboratory.findOne({ name: labName });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found.' });

    // Calculate start and end time for the reservation
    const startTime = new Date(`${reservationDate}T${reservationTime}`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    // Check for overlapping reservations for selected seats
    const overlappingReservations = await Reservation.find({
      laboratory: lab._id,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      'seats.seatNumber': { $in: seatIndices.map(i => i + 1) }
    });

    if (overlappingReservations.length > 0) {
      // Find which seats are already reserved
      const reservedSeats = new Set();
      overlappingReservations.forEach(res => {
        res.seats.forEach(seat => reservedSeats.add(seat.seatNumber));
      });
      const conflictSeats = seatIndices
        .map(i => i + 1)
        .filter(seatNum => reservedSeats.has(seatNum));
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${conflictSeats.join(', ')} already reserved for this time slot.`
      });
    }

    // Prepare seat objects for reservation
    const reservedSeats = seatIndices.map(i => ({
      seatNumber: i + 1
    }));

    // Create reservation
    const reservation = await Reservation.create({
      user: userId,
      laboratory: lab._id,
      seats: reservedSeats,
      startTime,
      endTime,
      isAnonymous,
      status: 'Pending'
    });

    res.status(201).json({ success: true, reservation });

  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
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
            seatData: JSON.stringify(seatData),
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

exports.showViewSlots = async (req, res) => {
  try {
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];
    const sevenDaysLaterDate = new Date();
    sevenDaysLaterDate.setDate(todayDate.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLaterDate.toISOString().split('T')[0];

    const defaultTime = '08:00';
    const defaultStartTime = new Date(`${todayStr}T${defaultTime}`);
    const defaultEndTime = new Date(defaultStartTime.getTime() + 30 * 60 * 1000);

    const timeOptions = [];
    for (let h = 8; h <= 17; h++) {
      for (let m of [0, 30]) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        timeOptions.push(`${hour}:${minute}`);
      }
    }

    const labs = await Laboratory.find({ isActive: true }).lean();

    const seatData = {};

    for (const lab of labs) {
      const reservations = await Reservation.find({
        laboratory: lab._id,
        startTime: { $lt: defaultEndTime },
        endTime: { $gt: defaultStartTime }
      }).lean();

      const reservedSeats = new Set();
      reservations.forEach(res => {
        res.seats.forEach(seat => reservedSeats.add(seat.seatNumber));
      });

      const maxSeat = lab.capacity || 0;
      seatData[lab.name] = [];

      for (let i = 1; i <= maxSeat; i++) {
        const isReserved = reservedSeats.has(i);
        seatData[lab.name].push({
          occupied: isReserved,
          user: isReserved ? { name: req.user.firstName + ' ' + req.user.lastName, anonymous: res.isAnonymous } : null
        });
      }
    }

    res.render('view-slots', {
      title: 'View Slots',
      currentUser: req.user,
      labs,
      seatData: JSON.stringify(seatData),
      today: todayStr,
      sevenDaysLater: sevenDaysLaterStr,
      timeOptions,
      additionalCSS: ['/css/seats.css'],
      additionalJS: ['/js/viewRes.js']
    });

  } catch (err) {
    console.error('Error showing reservation page:', err);
    res.redirect('/');
  }
};

exports.checkAvailableSlots = async (req, res) => {
  try {
    const { labName, date, time } = req.body;

    const lab = await Laboratory.findOne({ name: labName });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found' });

    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 mins slot

    console.log('Checking slots for:', {
      labName,
      date,
      time,
      startTime,
      endTime});

    // Find overlapping reservations
    const reservations = await Reservation.find({
      laboratory: lab._id,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    }).lean();

    const reservedSeats = new Set();
    reservations.forEach(res => {
      res.seats.forEach(seat => reservedSeats.add(seat.seatNumber));
    });

    const seatData = [];
    for (let i = 1; i <= lab.capacity; i++) {
      const isReserved = reservedSeats.has(i);
      seatData.push({
        occupied: isReserved,
        user: isReserved ? { name: 'Reserved User', anonymous: true } : null
      });
    }

    res.json({ success: true, seatData });
  } catch (err) {
    console.error('Slot check error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

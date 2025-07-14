const User = require('../models/Users');
const Laboratory = require('../models/Laboratories');
const Reservation = require('../models/Reservations');

// Middleware to check if user is a student
exports.checkStudentRole = async (req, res, next) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(200).send(`<script>alert('Only students can access this feature'); window.history.back();</script>`);
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
            return res.status(200).send(`<script>alert('Only lab technicians can access this feature'); window.history.back();</script>`);
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
      }).populate('user', 'firstName lastName email').lean();

      const maxSeat = lab.capacity || 0;
      const reservedSeatMap = new Map();

      reservations.forEach(res => {
        const fullName = `${res.user.firstName} ${res.user.lastName}`;
        const email = res.user.email;
      
        res.seats.forEach(seat => {
          reservedSeatMap.set(seat.seatNumber, {
            name: res.isAnonymous ? 'Anonymous' : fullName,
            email: res.isAnonymous ? null : email,
            anonymous: res.isAnonymous
          });
        });
      });

      seatData[lab.name] = [];
      for (let i = 1; i <= maxSeat; i++) {
        const user = reservedSeatMap.get(i);
        seatData[lab.name].push({
          occupied: !!user,
          user: user || null
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
      status: 'Reserved'
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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 6);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];

    const timeOptions = [];
    for (let h = 8; h <= 17; h++) {
      for (let m of [0, 30]) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        timeOptions.push(`${hour}:${minute}`);
      }
    }

    const laboratories = await Laboratory.find({ isActive: true }).lean();
    const students = await User.find({ isDeleted: false }).lean();

    const seatData = {};
    const defaultStart = new Date(`${todayStr}T08:00`);
    const defaultEnd = new Date(defaultStart.getTime() + 30 * 60 * 1000);

    for (const lab of laboratories) {
      const reservations = await Reservation.find({
        laboratory: lab._id,
        startTime: { $lt: defaultEnd },
        endTime: { $gt: defaultStart }
      }).populate('user', 'firstName lastName email').lean();

      const reservedSeatMap = new Map();
      reservations.forEach(res => {
        const fullName = `${res.user.firstName} ${res.user.lastName}`;
        const email = res.user.email;
        res.seats.forEach(seat => {
          reservedSeatMap.set(seat.seatNumber, {
            name: res.isAnonymous ? 'Anonymous' : fullName,
            email: res.isAnonymous ? null : email,
            anonymous: res.isAnonymous
          });
        });
      });

      seatData[lab.name] = [];
      for (let i = 1; i <= lab.capacity; i++) {
        const user = reservedSeatMap.get(i);
        seatData[lab.name].push({
          occupied: !!user,
          user: user || null
        });
      }
    }

    res.render('create-reservation-tech', {
      title: 'Create Reservation (Tech)',
      currentUser: req.user,
      labs: laboratories,
      students,
      currentLab: laboratories[0],
      seatData: JSON.stringify(seatData),
      today: todayStr,
      sevenDaysLater: sevenDaysLaterStr,
      timeOptions,
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
    const { labName, seatIndices, reservationDate, reservationTime, studentEmail, isAnonymous } = req.body;

    if (!labName || !studentEmail || !reservationDate || !reservationTime || !Array.isArray(seatIndices) || seatIndices.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing reservation data.' });
    }

    const student = await User.findOne({ email: studentEmail, role: 'Student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const lab = await Laboratory.findOne({ name: labName });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found.' });

    const startTime = new Date(`${reservationDate}T${reservationTime}`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const overlappingReservations = await Reservation.find({
      laboratory: lab._id,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      'seats.seatNumber': { $in: seatIndices.map(i => i + 1) }
    });

    if (overlappingReservations.length > 0) {
      const reservedSeats = new Set();
      overlappingReservations.forEach(res => {
        res.seats.forEach(seat => reservedSeats.add(seat.seatNumber));
      });
      const conflictSeats = seatIndices.map(i => i + 1).filter(seatNum => reservedSeats.has(seatNum));
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${conflictSeats.join(', ')} already reserved for this time slot.`
      });
    }

    const reservedSeats = seatIndices.map(i => ({ seatNumber: i + 1 }));

    const reservation = await Reservation.create({
      user: student._id,
      laboratory: lab._id,
      seats: reservedSeats,
      startTime,
      endTime,
      isAnonymous,
      status: 'Reserved'
    });

    res.status(201).json({ success: true, reservation });
  } catch (err) {
    console.error('Tech reservation error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
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

        // Get all reservations for this lab on the selected date
        const reservations = await Reservation.find({
            laboratory: labId,
            startTime: { $gte: selectedDate, $lte: endDate }
        }).populate('user', 'firstName lastName email profilePicture');

        // Generate all possible time slots
        const allTimeSlots = [];
        for (let hour = 8; hour < 18; hour++) {
            allTimeSlots.push({
                startTime: `${hour.toString().padStart(2, '0')}:00`,
                endTime: `${hour.toString().padStart(2, '0')}:30`
            });
            allTimeSlots.push({
                startTime: `${hour.toString().padStart(2, '0')}:30`,
                endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
            });
        }

        const results = {
            labName: laboratory.name,
            labId: laboratory._id,
            date: date,
            lastUpdated: new Date(),
            seats: []
        };

        // Check availability for each seat and all time slots
        for (let seatNum = 1; seatNum <= laboratory.capacity; seatNum++) {
            const seatData = {
                seatNumber: seatNum,
                timeSlots: []
            };

            allTimeSlots.forEach(timeSlot => {
                const slotStart = new Date(`${date}T${timeSlot.startTime}`);
                const slotEnd = new Date(`${date}T${timeSlot.endTime}`);

                // Check if this seat is reserved in any reservation during this time slot
                const reservation = reservations.find(res => {
                    return (
                        res.seats.some(s => s.seatNumber === seatNum) &&
                        res.startTime < slotEnd &&
                        res.endTime > slotStart
                    );
                });

                if (reservation) {
                    seatData.timeSlots.push({
                        startTime: timeSlot.startTime,
                        endTime: timeSlot.endTime,
                        status: 'Reserved',
                        reservedBy: {
                            _id: reservation.user._id,
                            name: `${reservation.user.firstName} ${reservation.user.lastName}`,
                            email: reservation.user.email,
                            profilePicture: reservation.user.profilePicture
                        },
                        reservationId: reservation._id
                    });
                } else {
                    seatData.timeSlots.push({
                        startTime: timeSlot.startTime,
                        endTime: timeSlot.endTime,
                        status: 'Available'
                    });
                }
            });

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
    sevenDaysLaterDate.setDate(todayDate.getDate() + 6);
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
      }).populate('user', 'firstName lastName email').lean();


      const reservedSeats = new Set();
      reservations.forEach(res => {
        const fullName = `${res.user.firstName} ${res.user.lastName}`;
        const email = res.user.email;
  
        res.seats.forEach(seat => {
          reservedSeats[seat.seatNumber] = {
            name: res.isAnonymous ? 'Anonymous' : fullName,
            email: res.isAnonymous ? null : email,
            anonymous: res.isAnonymous
          };
        });
      });


      const maxSeat = lab.capacity || 0;
      seatData[lab.name] = [];

      for (let i = 1; i <= lab.capacity; i++) {
        const userInfo = reservedSeats[i];
        seatData[lab.name].push({
          occupied: !!userInfo,
          user: userInfo || null
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
    }).populate('user', 'firstName lastName email').lean();

    const reservedSeatMap = new Map();

reservations.forEach(res => {
  const fullName = `${res.user.firstName} ${res.user.lastName}`;
  const email = res.user.email;

  res.seats.forEach(seat => {
    reservedSeatMap.set(seat.seatNumber, {
      name: res.isAnonymous ? 'Anonymous' : fullName,
      email: res.isAnonymous ? null : email,
      anonymous: res.isAnonymous
    });
  });
});

const seatData = [];
for (let i = 1; i <= lab.capacity; i++) {
  const user = reservedSeatMap.get(i);
  seatData.push({
    occupied: !!user,
    user: user || null
  });
}


res.json({ success: true, seatData });
  } catch (err) {
    console.error('Slot check error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Show the current user's reservations in the my_reservations.hbs view
exports.showMyReservations = async (req, res) => {
  try {
    const currentUser = await require('./AuthController').getCurrentUser(req);
    if (!currentUser) {
      return res.redirect('/login');
    }
    let reservations;
    let isTechnician = false;
    if (currentUser.role === 'Technician') {
      // Technician: show all reservations, include user info
      reservations = await require('../models/Reservations').find({})
        .populate('laboratory', 'name')
        .populate('user', 'firstName lastName email')
        .sort({ startTime: -1 })
        .lean();
      isTechnician = true;
    } else {
      // Student: show only their own
      reservations = await require('../models/Reservations').find({
        user: currentUser._id
      })
        .populate('laboratory', 'name')
        .sort({ startTime: -1 })
        .lean();
    }
    // Format reservations for the template
    const formattedReservations = reservations.map(res => ({
      _id: res._id,
      lab: res.laboratory && res.laboratory.name ? res.laboratory.name : '',
      date: res.startTime ? res.startTime.toISOString().split('T')[0] : '',
      time: res.startTime && res.endTime ? `${new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '',
      seat: res.seats && res.seats.length ? 'Seat ' + res.seats.map(s => s.seatNumber).join(', ') : '',
      status: res.status,
      user: res.user ? (res.user.firstName ? `${res.user.firstName} ${res.user.lastName}` : res.user.email) : undefined,
      userEmail: res.user ? res.user.email : undefined
    }));
    res.render('my_reservations', {
      title: isTechnician ? 'All Reservations' : 'My Reservations',
      reservations: formattedReservations,
      isTechnician,
      additionalCSS: ['/css/my_reservations.css'],
      additionalJS: ['/js/my_reservations.js'],
      currentUser: currentUser.toObject()
    });
  } catch (err) {
    console.error('Error rendering my reservations:', err);
    res.redirect('/');
  }
};

// Technician: Delete reservation by ID
exports.deleteReservation = async (req, res) => {
  try {
    const currentUser = await require('./AuthController').getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'Technician') {
      return res.status(403).json({ success: false, message: 'Only technicians can delete reservations.' });
    }
    const reservationId = req.params.id;
    const deleted = await require('../models/Reservations').findByIdAndDelete(reservationId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }
    res.status(200).json({ success: true, message: 'Reservation deleted.' });
  } catch (err) {
    console.error('Error deleting reservation:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Show edit reservation page for students or technicians
exports.showEditReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId).populate('laboratory', 'name image').populate('user', '_id');

    if (!reservation) {
      return res.status(404).send(`<script>alert('Reservation not found'); window.history.back();</script>`);
    }

    // convert reservation to object
    const plainReservation = reservation.toObject();

    // Allow editing if technician or reservation owner
    if (!(req.user.role === 'Technician' || reservation.user.equals(req.user._id))) {
      return res.status(403).send(`<script>alert('You can only edit your own reservations'); window.history.back();</script>`);
    }
    // Only allow editing if status is Reserved
    if (reservation.status !== 'Reserved') {
      return res.status(400).send(`<script>alert('Only Reserved reservations can be edited'); window.history.back();</script>`);
    }
    // Prepare data for form
    const labs = await Laboratory.find({ isActive: true }).lean();
    const timeOptions = [];
    for (let h = 8; h <= 17; h++) {
      for (let m of [0, 30]) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        timeOptions.push(`${hour}:${minute}`);
      }
    }
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 6);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];
    // For seat grid, reuse logic from showCreateReservation
    const seatData = {};
    const selectedStartTime = reservation.startTime;
    const selectedEndTime = reservation.endTime;
    for (const lab of labs) {
      const reservations = await Reservation.find({
        laboratory: lab._id,
        startTime: { $lt: selectedEndTime },
        endTime: { $gt: selectedStartTime },
        _id: { $ne: reservation._id } // Exclude this reservation
      }).populate('user', 'firstName lastName email').lean();
      const maxSeat = lab.capacity || 0;
      const reservedSeatMap = new Map();
      reservations.forEach(res => {
        const fullName = `${res.user.firstName} ${res.user.lastName}`;
        const email = res.user.email;
        res.seats.forEach(seat => {
          reservedSeatMap.set(seat.seatNumber, {
            name: res.isAnonymous ? 'Anonymous' : fullName,
            email: res.isAnonymous ? null : email,
            anonymous: res.isAnonymous
          });
        });
      });
      seatData[lab.name] = [];
      for (let i = 1; i <= maxSeat; i++) {
        const user = reservedSeatMap.get(i);
        seatData[lab.name].push({
          occupied: !!user,
          user: user || null
        });
      }
    }
    // Render create-reservation.hbs in edit mode
    res.render('create-reservation', {
      title: 'Edit Reservation',
      currentUser: req.user,
      labs,
      currentLab: plainReservation.laboratory,
      seatData: JSON.stringify(seatData),
      today: todayStr,
      sevenDaysLater: sevenDaysLaterStr,
      timeOptions,
      editMode: true,
      reservationToEdit: {
        _id: plainReservation._id,
        lab: plainReservation.laboratory.name,
        seatNumbers: plainReservation.seats.map(s => s.seatNumber),
        date: plainReservation.startTime.toISOString().split('T')[0],
        time: plainReservation.startTime.toTimeString().slice(0,5),
        isAnonymous: plainReservation.isAnonymous
      },
      additionalCSS: ['/css/seats.css', '/css/slotregis.css'],
      additionalJS: ['/js/createResStud.js']
    });
  } catch (err) {
    console.error('Error showing edit reservation page:', err);
    res.redirect('/reservations/my-reservations');
  }
};

// Handle reservation update by ID
exports.handleEditReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const { labName, seatIndices, reservationDate, reservationTime, isAnonymous } = req.body;
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }
    // Allow editing if technician or reservation owner
    if (!(req.user.role === 'Technician' || reservation.user.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reservations.' });
    }
    if (reservation.status !== 'Reserved') {
      return res.status(400).json({ success: false, message: 'Only Reserved reservations can be edited.' });
    }
    // Validate input
    if (!labName || !Array.isArray(seatIndices) || seatIndices.length === 0 || !reservationDate || !reservationTime) {
      return res.status(400).json({ success: false, message: 'Missing reservation data.' });
    }
    const lab = await Laboratory.findOne({ name: labName });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found.' });
    const startTime = new Date(`${reservationDate}T${reservationTime}`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
    // Check for overlapping reservations for selected seats (excluding this reservation)
    const overlappingReservations = await Reservation.find({
      laboratory: lab._id,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      'seats.seatNumber': { $in: seatIndices.map(i => i + 1) },
      _id: { $ne: reservation._id }
    });
    if (overlappingReservations.length > 0) {
      const reservedSeats = new Set();
      overlappingReservations.forEach(res => {
        res.seats.forEach(seat => reservedSeats.add(seat.seatNumber));
      });
      const conflictSeats = seatIndices.map(i => i + 1).filter(seatNum => reservedSeats.has(seatNum));
      return res.status(409).json({ success: false, message: `Seat(s) ${conflictSeats.join(', ')} already reserved for this time slot.` });
    }
    // Update reservation fields
    reservation.laboratory = lab._id;
    reservation.seats = seatIndices.map(i => ({ seatNumber: i + 1 }));
    reservation.startTime = startTime;
    reservation.endTime = endTime;
    reservation.isAnonymous = isAnonymous;
    await reservation.save();
    res.status(200).json({ success: true, message: 'Reservation updated successfully.' });
  } catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

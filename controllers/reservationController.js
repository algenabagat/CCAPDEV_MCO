const Reservation = require('../models/Reservations');

// GET all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('laboratory', 'name')
      .populate('user', 'name email');

    res.render('reservations', { reservations });
  } catch (err) {
    console.error('Error loading reservations:', err);
    res.status(500).send('Server error');
  }
};

// DELETE a reservation
exports.deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservations');
  } catch (err) {
    console.error('Error deleting reservation:', err);
    res.status(500).send('Server error');
  }
};

// UPDATE a reservation
exports.updateReservation = async (req, res) => {
  try {
    const { seat, reservationDate, startTime, endTime, status } = req.body;

    const updatedStart = new Date(`${reservationDate}T${startTime}`);
    const updatedEnd = new Date(`${reservationDate}T${endTime}`);

    await Reservation.findByIdAndUpdate(req.params.id, {
      startTime: updatedStart,
      endTime: updatedEnd,
      status: status,
      seats: [{ seatNumber: parseInt(seat) }]
    });

    res.redirect('/reservations');
  } catch (err) {
    console.error('Error updating reservation:', err);
    res.status(500).send('Server error');
  }
};

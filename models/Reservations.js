const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  laboratory: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
  seats: [{seatNumber: { type: Number, required: true }}],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['Reserved', 'Cancelled'], default: 'Reserved' },
  createdAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Reservation', reservationSchema);
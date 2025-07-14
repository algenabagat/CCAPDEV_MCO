const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /@dlsu\.edu\.ph$/ },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ['Student', 'Technician'], required: true },
  profilePicture: { type: String, default: "/img/pfp.png" }, // image URL or file path
  description: { type: String },
  rememberUntil: { type: Date },
  isDeleted: { type: Boolean, default: false },
  reservations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
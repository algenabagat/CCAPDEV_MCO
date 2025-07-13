const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    laboratory: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
    seatNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    timeSlots: [{
        startTime: { type: String, required: true }, // Keep as String for simplicity
        endTime: { type: String, required: true },
        status: { 
            type: String, 
            enum: ['Available', 'Reserved', 'Blocked'], 
            default: 'Available' 
        },
        reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
        blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slot', slotSchema);
const mongoose = require('mongoose');

const slotSchema = new Schema({
    laboratory: { type: Schema.Types.ObjectId, ref: 'Laboratory', required: true },
    seatNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    timeSlots: [{
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        status: { type: String, enum: ['Available', 'Reserved', 'Blocked'], default: 'Available' },
        reservedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reservation: { type: Schema.Types.ObjectId, ref: 'Reservation' }
    }]
});

module.exports = mongoose.model('Slot', slotSchema);
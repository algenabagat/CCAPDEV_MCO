const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    capacity: { type: Number, required: true },
    location: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Laboratory', laboratorySchema);
// FOR DB INITIALIZATION

const mongoose = require('mongoose');
const User = require('./models/Users');
const Laboratory = require('./models/Laboratories');
const Slot = require('./models/Slots');
const Reservation = require('./models/Reservations');


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/labReservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDB = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await Slot.deleteMany({});
    await Reservation.deleteMany({});
    console.log('Cleared existing slot and reservation data');

    // Get existing lab and user
    const lab = await Laboratory.findById('707f1f77bcf86cd799439011');
    const user = await User.findById('6868a35f639f6a35f8980f68');

    if (!lab || !user) {
      throw new Error('Lab or user not found in database');
    }

    // Create slots for all 35 seats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const slots = [];
    const timeSlotsToReserve = [];

    console.log(`Creating slots for lab ${lab.name}...`);
    
    for (let seatNum = 1; seatNum <= lab.capacity; seatNum++) {
      const slot = {
        laboratory: lab._id,
        seatNumber: seatNum,
        date: today,
        timeSlots: [],
        lastUpdated: new Date()
      };

      // Create time slots (8AM-6PM)
      for (let hour = 8; hour < 18; hour++) {
        // First slot (e.g., 8:00-8:30)
        slot.timeSlots.push({
          startTime: `${hour}:00`,
          endTime: `${hour}:30`,
          status: "Available"
        });

        // Second slot (e.g., 8:30-9:00)
        const timeSlot = {
          startTime: `${hour}:30`,
          endTime: `${hour+1}:00`,
          status: seatNum === 1 ? "Reserved" : "Available" // Reserve only seat 1
        };

        if (seatNum === 1) {
          timeSlot._id = new mongoose.Types.ObjectId();
          timeSlot.reservedBy = user._id;
          timeSlotsToReserve.push(timeSlot._id);
        }

        slot.timeSlots.push(timeSlot);
      }

      slots.push(slot);
    }

    // Insert slots
    const createdSlots = await Slot.insertMany(slots);
    console.log(`Created ${createdSlots.length} slots`);

    // Create reservation for seat 1 at 8:30-9:00
    console.log('Creating reservation...');
    const reservation = new Reservation({
      user: user._id,
      laboratory: lab._id,
      seats: [{
        seatNumber: 1,
        timeSlot: timeSlotsToReserve[0]
      }],
      startTime: new Date(today.setHours(8, 30, 0, 0)),
      endTime: new Date(today.setHours(9, 0, 0, 0)),
      isAnonymous: false,
      status: "Active",
      createdAt: new Date()
    });

    const createdReservation = await reservation.save();
    console.log(`Created reservation ID: ${createdReservation._id}`);

    // Update the reserved time slot
    await Slot.updateOne(
      { 'timeSlots._id': timeSlotsToReserve[0] },
      { $set: { 'timeSlots.$.reservation': createdReservation._id } }
    );

    // Update user with reservation
    await User.findByIdAndUpdate(user._id, {
      $push: { reservations: createdReservation._id }
    });
    console.log('Updated user with reservation');

    console.log('✅ Database seeding completed successfully!');
    
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
};

seedDB();
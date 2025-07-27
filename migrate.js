const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/Users'); 

const saltRounds = 10; 

async function migratePasswords() {
  try {
    // Connect to MongoDB 
    await mongoose.connect('mongodb://localhost:27017/labReservation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch all users with non-hashed passwords
    const users = await User.find({
      password: { $not: /^\$2[ayb]\$.{56}$/ } // Regex to exclude bcrypt hashes
    });

    if (users.length === 0) {
      console.log('No unhashed passwords found. Migration complete.');
      return;
    }

    console.log(`Found ${users.length} users with plaintext passwords. Migrating...`);

    // Hash each password and save
    for (const user of users) {
      if (!user.password.match(/^\$2[ayb]\$.{56}$/)) { // Double-check
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;
        await user.save();
        console.log(`Updated password for user: ${user.email}`);
      }
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

migratePasswords();
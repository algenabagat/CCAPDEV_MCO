const User = require('../models/Users');
const AuthController = require('./AuthController');
const Reservation = require('../models/Reservations');

const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: 'public/uploads/profile-pictures',
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG images are allowed'), false);
    }
  }
}).single('profilePicture');


exports.displayProfilePage = async (req, res) => {
    try {
        const { email } = req.params;
        
        // Find user by email
        const user = await User.findOne({ email: email, isDeleted: false });
        if (!user) {
            return res.render('profile', {
                title: 'Profile Not Found - Lab Reservation System',
                error: 'User not found',
                additionalCSS: ['/css/profile.css']
            });
        }

        // Get real reservations for the user (excluding anonymous ones)
        const reservations = await Reservation.find({
            user: user._id,
            isAnonymous: false
        })
        .populate('laboratory', 'name')
        .sort({ startTime: -1 }); // Sort by most recent first

        // Format reservations for display
        const formattedReservations = reservations.map(res => ({
            id: res._id,
            lab: res.laboratory.name,
            date: res.startTime.toISOString().split('T')[0],
            time: `${formatTime(res.startTime)} - ${formatTime(res.endTime)}`,
            seat: `Seat ${res.seats.map(s => s.seatNumber).join(', ')}`,
            status: res.status
        }));

        // Helper function to format time
        function formatTime(date) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Get current logged-in user for navbar
        const currentUser = await AuthController.getCurrentUser(req);

        res.render('profile', {
            title: `${user.firstName} ${user.lastName} - Profile`,
            user: user.toObject(),
            currentUser: currentUser ? currentUser.toObject() : null,
            reservations: formattedReservations,
            additionalCSS: ['/css/profile.css'],
            additionalJS: ['/js/profile.js']
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.render('profile', {
            title: 'Profile Error - Lab Reservation System',
            error: 'An error occurred while loading the profile',
            additionalCSS: ['/css/profile.css']
        });
    }
};

// For current user's own profile
exports.displayMyProfile = async (req, res) => {
    try {
        const currentUser = await AuthController.getCurrentUser(req);
        if (!currentUser) {
            return res.redirect('/login');
        }

        // Redirect to their profile page using email
        res.redirect(`/profile/${currentUser.email}`);
    } catch (error) {
        console.error('My profile error:', error);
        res.redirect('/login');
    }
};

exports.updateProfile = async (req, res) => {
  try {
    const currentUser = await AuthController.getCurrentUser(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email } = req.params;
    
    if (currentUser.email !== email) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Handle the upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { firstName, lastName, description } = req.body;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
      }

      // Update user data
      currentUser.firstName = firstName;
      currentUser.lastName = lastName;
      currentUser.description = description || '';

      // Update profile picture if uploaded
      if (req.file) {
        currentUser.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      }

      await currentUser.save();

      res.status(200).json({ 
        user: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          description: currentUser.description,
          email: currentUser.email,
          profilePicture: currentUser.profilePicture
        }
      });
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'An error occurred while updating the profile' });
  }
};

exports.searchUsers = async (req, res) => {
    try {
        const { name, email, role } = req.query;
        let users = [];
        let showResults = false;

        // Get current logged-in user for navbar
        const currentUser = await AuthController.getCurrentUser(req);

        // Only search if there are query parameters
        if (name || email || role) {
            showResults = true;
            
            // Build query object
            const query = { isDeleted: false };
            
            if (name) {
                query.$or = [
                    { firstName: { $regex: name, $options: 'i' } },
                    { lastName: { $regex: name, $options: 'i' } }
                ];
            }
            
            if (email) {
                query.email = { $regex: email, $options: 'i' };
            }
            
            if (role && role !== 'all') {
                query.role = role;
            }
            
            // Search users in database
            users = await User.find(query)
                .select('firstName lastName email role')
                .lean();
                
            // Log the users found for debugging
            console.log('Search query:', query);
            console.log('Number of users found:', users.length);
            console.log('Users data:', users);
            console.log('Show results:', showResults);
        }
    

        const templateData = {
            title: 'Search Users - Lab Reservation System',
            users: users,
            showResults: showResults,
            searchQuery: { name, email, role },
            additionalCSS: ['/css/search-users.css'],
            currentUser: currentUser ? currentUser.toObject() : null
        };

        // Log what we're sending to template
        console.log('Template data being sent:', {
            usersCount: templateData.users.length,
            users: templateData.users,
            showResults: templateData.showResults,
            searchQuery: templateData.searchQuery
        });

        res.render('search-users', templateData);
        console.log(templateData);
    } catch (error) {
        console.error('Search users error:', error);
        res.render('search-users', {
            title: 'Search Users - Lab Reservation System',
            error: 'An error occurred while searching users',
            additionalCSS: ['/css/search-users.css'],
            currentUser: null
        });
    }
};

exports.deleteProfile = async (req, res) => {
    const currentUser = await AuthController.getCurrentUser(req);
    if (!currentUser) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    currentUser.isDeleted = true;
    currentUser.reservations = []; // Clear reservations
    await currentUser.save();
    
    res.render('delete-profile', {
        title: 'Delete Account - Lab Reservation System',
        additionalCSS: ['/css/delete-profile.css'],
    });
};
exports.deleteAccount = async (req, res) => {
    try {
        const currentUser = await AuthController.getCurrentUser(req);
        if (!currentUser) {
            return res.redirect('/login');
        }

        // Delete all reservations associated with this user
        await Reservation.deleteMany({ user: currentUser._id });

        // Soft delete the user account
        currentUser.isDeleted = true;
        currentUser.reservations = []; // Clear reservations array
        await currentUser.save();

        // Clear the authentication cookie
        res.clearCookie('userId');

        // Render the delete confirmation page
        res.render('delete-profile', {
            title: 'Account Deleted - Lab Reservation System',
            message: 'Your account and all associated reservations have been successfully deleted.',
            redirectUrl: '/',
            delay: 2000,
            additionalCSS: ['/css/logout.css'],
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.redirect('/profile?error=Failed to delete account');
    }
};
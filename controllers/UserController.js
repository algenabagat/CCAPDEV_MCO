const User = require('../models/Users');
const AuthController = require('./AuthController');
const Reservation = require('../models/Reservations');

const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
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


// Display user profile page by email
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

// Update user profile
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

// Search for users based on name, email, and role
exports.searchUsers = async (req, res) => {
    try {
        const { name, email, role, error, success } = req.query;
        let users = [];
        let showResults = false;

        // Get current logged-in user for navbar
        const currentUser = await AuthController.getCurrentUser(req);

        // Only search if there are query parameters (excluding error/success messages)
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
            error: error,
            success: success,
            additionalCSS: ['/css/search-users.css'],
            currentUser: currentUser ? currentUser.toObject() : null
        };

        // Log what we're sending to template
        console.log('Template data being sent:', {
            usersCount: templateData.users.length,
            users: templateData.users,
            showResults: templateData.showResults,
            searchQuery: templateData.searchQuery,
            error: templateData.error,
            success: templateData.success
        });

        res.render('search-users', templateData);
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

// Delete user account
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

// Allow technicians to delete any user's profile
exports.deleteUserByTechnician = async (req, res) => {
    try {
        const currentUser = await AuthController.getCurrentUser(req);
        if (!currentUser) {
            return res.redirect('/login');
        }

        // Check if current user is a technician
        if (currentUser.role !== 'Technician') {
            return res.status(403).json({ error: 'Only technicians can delete user accounts' });
        }

        const { email } = req.params; // Get email from URL parameter
        
        // Find the user to delete
        const userToDelete = await User.findOne({ email: email, isDeleted: false });
        if (!userToDelete) {
            return res.redirect('/search-users?error=User not found');
        }

        // Prevent technicians from deleting other technicians
        if (userToDelete.role === 'Technician') {
            return res.redirect('/search-users?error=Cannot delete other technician accounts');
        }

        // Delete all reservations associated with this user
        await Reservation.deleteMany({ user: userToDelete._id });

        // Soft delete the user account
        userToDelete.isDeleted = true;
        userToDelete.reservations = []; // Clear reservations array
        await userToDelete.save();

        // Redirect back to search users page with success message
        res.redirect('/search-users?success=User account successfully deleted');

    } catch (error) {
        console.error('Delete user by technician error:', error);
        res.redirect('/search-users?error=Failed to delete user account');
    }
};

// Allow technicians to update any user's profile
exports.updateUserByTechnician = async (req, res) => {
    try {
        const currentUser = await AuthController.getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if current user is a technician
        if (currentUser.role !== 'Technician') {
            return res.status(403).json({ error: 'Only technicians can update user accounts' });
        }

        const { email } = req.params; // Get email from URL parameter
        
        // Find the user to update
        const userToUpdate = await User.findOne({ email: email, isDeleted: false });
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Handle the upload for profile picture
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { firstName, lastName, description, role } = req.body;
            
            // Validate required fields
            if (!firstName || !lastName) {
                return res.status(400).json({ error: 'First name and last name are required' });
            }

            // Validate role if provided
            const validRoles = ['Student', 'Technician'];
            if (role && !validRoles.includes(role)) {
                return res.status(400).json({ error: 'Invalid role specified' });
            }

            // Update user data
            userToUpdate.firstName = firstName;
            userToUpdate.lastName = lastName;
            userToUpdate.description = description || '';
            
            // Allow technicians to update user roles (but not to technician unless they're updating a technician)
            if (role) {
                // Prevent creating new technicians unless updating an existing technician
                if (role === 'Technician' && userToUpdate.role !== 'Technician') {
                    return res.status(403).json({ error: 'Cannot promote users to technician role' });
                }
                userToUpdate.role = role;
            }

            // Update profile picture if uploaded
            if (req.file) {
                userToUpdate.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
            }

            await userToUpdate.save();

            res.status(200).json({ 
                user: {
                    firstName: userToUpdate.firstName,
                    lastName: userToUpdate.lastName,
                    description: userToUpdate.description,
                    email: userToUpdate.email,
                    role: userToUpdate.role,
                    profilePicture: userToUpdate.profilePicture
                }
            });
        });

    } catch (error) {
        console.error('Update user by technician error:', error);
        res.status(500).json({ error: 'An error occurred while updating the user profile' });
    }
};
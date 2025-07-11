const User = require('../models/Users');
const AuthController = require('./AuthController');


exports.displayProfilePage = async (req, res) => {
    try {
        const { email } = req.params; // Get email from URL parameter
        
        // Find user by email
        const user = await User.findOne({ email: email, isDeleted: false });
        if (!user) {
            return res.render('profile', {
                title: 'Profile Not Found - Lab Reservation System',
                error: 'User not found',
                additionalCSS: ['/css/profile.css']
            });
        }

        // Mock reservations data for the specific user
        const mockReservations = [
            {
                lab: 'GK404',
                date: '2023-11-15',
                time: '10:00 - 12:00',
                seat: 'Seat 12',
                status: 'Confirmed'
            },
            {
                lab: 'GK403',
                date: '2023-11-16',
                time: '14:00 - 16:00',
                seat: 'Seat 5',
                status: 'Pending'
            }
        ];

        // Get current logged-in user for navbar
        const currentUser = await AuthController.getCurrentUser(req);

        res.render('profile', {
            title: `${user.firstName} ${user.lastName} - Profile`,
            user: user.toObject(),  // The profile being viewed
            currentUser: currentUser ? currentUser.toObject() : null, // For navbar
            reservations: mockReservations,
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

// Add a new method for current user's own profile
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

        const { firstName, lastName, description } = req.body;
        const { email } = req.params;

        // Verify the user is updating their own profile
        if (currentUser.email !== email) {
            return res.status(403).json({ error: 'You can only update your own profile' });
        }

        // Validate input
        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'First name and last name are required' });
        }

        // Update the user's profile
        currentUser.firstName = firstName;
        currentUser.lastName = lastName;
        currentUser.description = description || '';

        await currentUser.save();

        // Return success response
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: {
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                description: currentUser.description,
                email: currentUser.email
            }
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

        // Soft delete - mark user as deleted instead of actually removing from database
        currentUser.isDeleted = true;
        await currentUser.save();

        // Clear the authentication cookie
        res.clearCookie('userId');

        // Render the delete confirmation page (which can auto-redirect using meta refresh)
        res.render('delete-profile', {
            title: 'Account Deleted - Lab Reservation System',
            message: 'Your account has been successfully deleted.',
            redirectUrl: '/',    // Where to redirect
            delay: 2000,        // 2 second delay
            additionalCSS: ['/css/logout.css'],
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.redirect('/profile?error=Failed to delete account');
    }
};
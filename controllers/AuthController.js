const User = require('../models/Users');

exports.getCurrentUser = async (req) => {
    try {
        const userId = req.cookies.userId;
        if (!userId) return null;
        
        const user = await User.findById(userId);
        if (!user || user.isDeleted) {
            return null;
        }
        return user;
    } catch (err) {
        console.error('Error getting current user:', err);
        return null;
    }
};

// Then modify your existing routes to use it
exports.displayLoginPage = (req, res) => {
    res.render('login', {
        title: 'Login - Lab Reservation System',
        additionalCSS: ['/css/login.css'],
        additionalJS: ['/js/login.js']
    });
}

exports.displayRegisterPage = (req, res) => {
    res.render('register', {
        title: 'Register - Lab Reservation System',
        additionalCSS: ['/css/register.css'],
        additionalJS: ['/js/register.js']
    });
}


exports.handleLogin = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        // 1. Find user by email
        const user = await User.findOne({ email, isDeleted: false });
        if (!user) {
            return res.redirect('/login?error=Invalid email or password');
        }
        
        // 2. Compare passwords
        if (user.password !== password) {
            return res.redirect('/login?error=Invalid email or password');
        }
        
        // 3. Set cookie with user ID
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };

        if (rememberMe) {
            cookieOptions.maxAge = 21 * 24 * 60 * 60 * 1000; // 3 weeks
            // Update rememberUntil in database
            user.rememberUntil = new Date(Date.now() + cookieOptions.maxAge);
            await user.save();
        }

        res.cookie('userId', user._id.toString(), cookieOptions);
        
        // Redirect to the main page 
        console.log('User logged in:', user.email);
        return res.redirect('/');

    } catch (err) {
        console.error('Login error:', err);
        return res.redirect('/login?error=An error occurred during login');
    }
};

exports.handleLogout = (req, res) => {
    // Clear the userId cookie
    res.clearCookie('userId');
    
    // Render a minimal logout page that will handle the redirect
    res.render('logout', {
        title: 'Logging out...',
        redirectUrl: '/',    // Where to redirect
        delay: 2000,        // 2 second delay
        additionalCSS: ['/css/logout.css'],
    });
};

exports.requireAuth = async (req, res, next) => {
    const userId = req.cookies.userId;
    
    if (!userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(userId);
        if (!user || user.isDeleted) {
            res.clearCookie('userId');
            return res.redirect('/login');
        }

        req.user = user; // Attach user to request
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.clearCookie('userId');
        return res.redirect('/login');
    }
};

// This function checks if the user is logged in and renders the index page accordingly
exports.isLoggedIn = async (req, res) => {
    try {
        const userId = req.cookies.userId;
        let user = null;
        
        if (userId) {
            user = await User.findById(userId);
            if (user && user.isDeleted) {
                res.clearCookie('userId');
                user = null;
            }
        }
        
        res.render('index', { 
            user: user,
            additionalCSS: ['/css/index.css']
        });
    } catch (err) {
        console.error('Error rendering index:', err);
        res.render('index', { user: null });
    }
};


exports.displayProfilePage = async (req, res) => {
    try {
        // For now, get user data from session or use mock data
        const user = await this.getCurrentUser(req);
        if (!user) {
            return res.redirect('/login');
        }

        // Mock reservations data
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

        res.render('profile', {
            title: 'Profile - Lab Reservation System',
            user: user.toObject(),  // Convert Mongoose document to plain object
            reservations: mockReservations,
            additionalCSS: ['/css/profile.css'],
            additionalJS: ['/js/profile.js']
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.redirect('/login');
    }
};



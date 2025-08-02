const User = require('../models/Users');
const Laboratory = require('../models/Laboratories');
const bcrypt = require('bcrypt');

const logError = require('../utils/logError');

// Get the currently logged-in user
exports.getCurrentUser = async (req) => {
    try {
        const userId = req.session.userId;
        if (!userId) return null;
        
        const user = await User.findById(userId);
        if (!user || user.isDeleted) {
            return null;
        }
        return user;
    } catch (err) {
        await logError({ err: err, req, location: 'AuthController.getCurrentUser' });
        console.error('Error getting current user:', err);
        return null;
        
    }
};

// Display the login page
exports.displayLoginPage = (req, res) => {
    res.render('login', {
        title: 'Login - Lab Reservation System',
        additionalCSS: ['/css/login.css'],
        additionalJS: ['/js/login.js']
    });
}

// Display the registration page
exports.displayRegisterPage = (req, res) => {
    res.render('register', {
        title: 'Register - Lab Reservation System',
        additionalCSS: ['/css/register.css'],
        additionalJS: ['/js/register.js']
    });
}

// Update the handleLogin function
exports.handleLogin = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        // 1. Find user by email
        const user = await User.findOne({ email, isDeleted: false });
        if (!user) {
            return res.redirect('/login?error=Invalid email or password');
        }
        
        // 2. Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/login?error=Invalid email or password');
        }
        
        // 3. Store user in session
        req.session.userId = user._id.toString();
        req.session.user = user; // Store full user object for convenience

        if (rememberMe) {
            req.session.cookie.maxAge = 21 * 24 * 60 * 60 * 1000; // 3 weeks
            // Update rememberUntil in database
            user.rememberUntil = new Date(Date.now() + req.session.cookie.maxAge);
            await user.save();
        }
        
        //throw new Error('Simulated error for testing catch block');

        // Redirect to the main page 
        return res.redirect('/');

    } catch (err) {
        await logError({ err: err, req, location: 'AuthController.handleLogin' });
        console.error('Login error:', err);
        return res.redirect('/login?error=An error occurred during login');
    }
};

// Handle user logout
exports.handleLogout = (req, res) => {
    // Clear the userId cookie
    res.clearCookie('userId');

    // Destroy the session
    req.session.destroy();

    // Render a minimal logout page that will handle the redirect
    res.render('logout', {
        title: 'Logging out...',
        redirectUrl: '/',    // Where to redirect
        delay: 2000,        // 2 second delay
        additionalCSS: ['/css/logout.css'],
    });
};


// Update the handleRegister function
exports.handleRegister = async (req, res) => {
    try {

        const {
            'first-name': firstName,
            'last-name': lastName,
            email,
            password
        } = req.body;

        // Checks if a user is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/register?error=Email already registered');
        }

        // Hash the password
        const saltRounds = 10; // Number of salt rounds for hashing
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Creates new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword, // Store the hashed password
            role: 'Student',
            isDeleted: false,
            createdAt: new Date()
        });

        await newUser.save();

        // Redirect to login page with success message
        return res.redirect('/login?success=Registration successful. Please log in.');
        
    } catch (err) {
        await logError({ err: err, req, location: 'AuthController.handleRegister' });
        console.error('Registration error:', err);
        return res.redirect('/register?error=Registration failed');
    }
};

// Middleware to check if user is authenticated
exports.requireAuth = async (req, res, next) => {
    const userId = req.session.userId;
    
    if (!userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(userId);
        if (!user || user.isDeleted) {
            req.session.destroy();
            return res.redirect('/login');
        }

        req.user = user; // Attach user to request
        next();
    } catch (err) {
        await logError({ err: err, req, location: 'AuthController.requireAuth' });
        console.error('Auth middleware error:', err);
        req.session.destroy();
        return res.redirect('/login');
    }
};

// This function checks if the user is logged in and renders the index page accordingly
exports.isLoggedIn = async (req, res) => {
    try {
        const userId = req.session.userId;
        let user = null;
        
        
        if (userId) {
            user = await User.findById(userId);
            if (user && user.isDeleted) {
                req.session.destroy();
                user = null;
            }
        }

        const laboratories = await Laboratory.find({ isActive: true }).lean();

        res.render('index', { 
            user: user,
            currentUser: user, // Add currentUser for navbar
            laboratories: laboratories,
            additionalCSS: ['/css/index.css']
        });
    } catch (err) {
        await logError({ err: err, req, location: 'AuthController.isLoggedIn' });
        console.error('Error rendering index:', err);
        res.render('index', { user: null, currentUser: null });
    }
};





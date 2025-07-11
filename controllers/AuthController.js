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

exports.handleRegister = async (req, res) => {
    try {
        const {
            'first-name': firstName,
            'last-name': lastName,
            email,
            password,
            'account-type': accountType
        } = req.body;

        // Checks if a user is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect('/register?error=Email already registered');
        }

        // Creates new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            role: accountType === 'tech' ? 'Technician' : 'Student',
            isDeleted: false,
            createdAt: new Date()
        });

        await newUser.save();

        // Redirect to login page with success message
        return res.redirect('/login?success=Registration successful. Please log in.');
        
    } catch (err) {
        console.error('Registration error:', err);
        return res.redirect('/register?error=Registration failed');
    }
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
            currentUser: user, // Add currentUser for navbar
            additionalCSS: ['/css/index.css']
        });
    } catch (err) {
        console.error('Error rendering index:', err);
        res.render('index', { user: null, currentUser: null });
    }
};





const User = require('../models/Users');

// Function to create a sample user (optional)
async function createSampleUser() {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: 'john.doe@dlsu.edu.ph' });
        if (!existingUser) {
            const sampleUser = new User({
                email: 'john.doe@dlsu.edu.ph',
                password: 'hashedPassword123', // In real app, hash this!
                role: 'Student',
                description: 'Computer Science student'
            });
            await sampleUser.save();
            console.log('Sample user created:', sampleUser);
        } else {
            console.log('Sample user already exists');
        }
    } catch (error) {
        console.error('Error creating sample user:', error);
    }
}

// Controller functions
const userController = {
    // GET /register - Show registration form
    showRegister: (req, res) => {
        res.render('register', { 
            title: 'Register - Lab Reservation System',
            additionalCSS: ['/css/register.css']
        });
    },

    // POST /register - Handle registration
    handleRegister: async (req, res) => {
        try {
            const { email, password, role, description } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.render('register', {
                    title: 'Register - Lab Reservation System',
                    additionalCSS: ['/css/register.css'],
                    error: 'Email already exists'
                });
            }

            // Create new user
            const newUser = new User({
                email,
                password, // In production, hash this!
                role,
                description
            });

            await newUser.save();
            
            // Set session data
            req.session.userId = newUser._id;
            req.session.user = newUser;
            
            res.redirect('/');
        } catch (error) {
            console.error('Registration error:', error);
            res.render('register', {
                title: 'Register - Lab Reservation System',
                additionalCSS: ['/css/register.css'],
                error: 'Registration failed. Please try again.'
            });
        }
    },

    // GET /login - Show login form
    showLogin: (req, res) => {
        res.render('login', { 
            title: 'Login - Lab Reservation System',
            additionalCSS: ['/css/login.css']
        });
    },

    // POST /login - Handle login
    handleLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const user = await User.findOne({ email, isDeleted: false });
            
            if (!user || user.password !== password) { // In production, use proper password hashing
                return res.render('login', {
                    title: 'Login - Lab Reservation System',
                    additionalCSS: ['/css/login.css'],
                    error: 'Invalid email or password'
                });
            }

            // Set session data
            req.session.userId = user._id;
            req.session.user = user;
            
            res.redirect('/');
        } catch (error) {
            console.error('Login error:', error);
            res.render('login', {
                title: 'Login - Lab Reservation System',
                additionalCSS: ['/css/login.css'],
                error: 'Login failed. Please try again.'
            });
        }
    },

    // GET /profile - Show user profile
    showProfile: async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.redirect('/login');
            }

            const user = await User.findById(req.session.userId);
            if (!user || user.isDeleted) {
                req.session.destroy();
                return res.redirect('/login');
            }

            res.render('profile', {
                title: 'Profile - Lab Reservation System',
                additionalCSS: ['/css/profile.css'],
                user: user,
                additionalJS: ['/js/profile.js']
            });
        } catch (error) {
            console.error('Profile error:', error);
            res.redirect('/login');
        }
    },

    // POST /logout - Handle logout
    handleLogout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/');
        });
    }
};

module.exports = { userController, createSampleUser };
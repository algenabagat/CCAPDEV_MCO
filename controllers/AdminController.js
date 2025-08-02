const User = require('../models/Users');
const logError = require('../utils/logError');

// Check if user is Admin
exports.checkAdminRole = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(userId);
        if (!user || user.isDeleted || user.role !== 'Admin') {
            return res.status(200).send(`<script>alert('Only admins can access this feature'); window.history.back();</script>`);
        }

        req.user = user;
        next();
    } catch (err) {
        await logError({ err: err, req, location: 'AdminController.checkAdminRole' });
        console.error('Admin middleware error:', err);
    }
};

// Display admin page
exports.displayAdminPage = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false })
            .select('firstName lastName email role createdAt')
            .sort({ createdAt: -1 })
            .lean();

        res.render('admin', {
            title: 'Admin Panel - Lab Reservation System',
            users: users,
            currentUser: req.user,
            additionalCSS: ['/css/admin.css'],
            additionalJS: ['/js/admin.js']
        });
    } catch (err) {
        await logError({ err: err, req, location: 'AdminController.displayAdminPage' });
        console.error('Error loading admin page:', err);
        res.redirect('/?error=Failed to load admin page');
    }
};

// Update role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, newRole } = req.body;

        // Validate role
        const validRoles = ['Student', 'Technician', 'Admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role specified' 
            });
        }

        // Prevent admin from changing their own role
        if (userId === req.session.userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot change your own role' 
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role: newRole },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            message: `Role updated to ${newRole}`,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        await logError({ err: err, req, location: 'AdminController.updateUserRole' });
        console.error('Error updating user role:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update user role' 
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Prevent admin from deleting themselves
        if (userId === req.session.userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });

    } catch (err) {
        await logError({ err: err, req, location: 'AdminController.deleteUser' });
        console.error('Error deleting user:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete user' 
        });
    }
}; 
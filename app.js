const express = require('express');
const { engine } = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const PORT = 3000;  // Define the port number
const cookieParser = require('cookie-parser');


// Import routes
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');

// Set up Handlebars as the template engine
app.engine('hbs', engine({
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    extname: 'hbs',
    helpers: {
        eq: function(a, b) {
            return a === b;
        },
        debug: function(data) {
            console.log('Handlebars debug:', data);
            return '';
        },
        json: function(data) {
            return JSON.stringify(data);
        },
        gt: function(a, b) {
            return a > b;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/labReservation')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });


// Route handlers
app.use('/', indexRoutes);
app.use('/users', userRoutes);


app.get('/register', (req, res) => {
    res.render('register', {
        additionalCSS: ['/css/register.css'],
        additionalJS: ['/js/register.js']
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const { engine } = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/Users'); // Import your User model
// Import routes
const indexRoutes = require('./routes/indexRoutes');
const searchRoutes = require('./routes/searchRoutes');
const PORT = 3000;

// Set up Handlebars as the template engine
app.engine('hbs', engine({
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    extname: 'hbs',
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/labReservation', {
useNewUrlParser: true,
useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});



app.use('/', indexRoutes);
app.use('/search', searchRoutes);

app.get('/register', (req, res) => {
    res.render('register', {
        additionalCSS: ['/css/register.css'],
        additionalJS: ['/js/register.js']
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
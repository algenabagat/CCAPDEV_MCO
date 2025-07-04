const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.listen(3000);

 mongoose.connect('mongodb://localhost:27017/labReservation', {
 useNewUrlParser: true,
 useUnifiedTopology: true
 });

app.get('/', (req, res) => {
    res.send('Hello, World!');
    });
console.log('Server is running on port 3000');
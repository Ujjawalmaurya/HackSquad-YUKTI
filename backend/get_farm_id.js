const mongoose = require('mongoose');
const Farm = require('./models/Farm');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const farm = await Farm.findOne();
        if (farm) {
            console.log('Found Farm ID:', farm._id.toString());
        } else {
            console.log('No farms found.');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    });

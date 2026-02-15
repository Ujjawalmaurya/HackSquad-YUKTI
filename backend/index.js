const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const Farm = require('./models/Farm');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/vegetation', require('./routes/vegetation'));

app.get('/', (req, res) => {
    res.status(200).send('API is running...');
});

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        seedData();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    });

async function seedData() {
    const count = await Farm.countDocuments();
    if (count === 0) {
        const defaultFarm = new Farm({
            name: "North Field A",
            location: { lat: 28.6139, lng: 77.2090 },
            size: 15.5,
            cropType: "Wheat",
            farmerName: "amittt",
            analysisHistory: []
        });
        await defaultFarm.save();
        console.info('Seeded default farm');
    }
}

// Server started in mongoose.connect callback

require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change if necessary
    password: '', // Add your MySQL password if required
    database: 'vehicle_management'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// API to get all vehicles
app.get('/vehicles', (req, res) => {
    db.query('SELECT * FROM vehicles', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API to add a vehicle
app.post('/vehicles', (req, res) => {
    const { plate_number, brand, model, year, color } = req.body;
    const sql = 'INSERT INTO vehicles (plate_number, brand, model, year, color) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [plate_number, brand, model, year, color], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Vehicle added successfully', id: result.insertId });
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

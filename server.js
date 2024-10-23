const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); 
const db = require('./config/db'); 
require('dotenv').config();

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

const port = process.env.PORT || 5005;

// Register Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err, result) => {
            if (err) {
                console.error('Error creating user:', err); // Log the error
                return res.status(500).send('Error creating user');
            }
            console.log(`User registered successfully: ${username}`); // Log successful registration
            res.status(201).send('User created');
        }
    );
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err); // Log the error
            return res.status(500).send('Error fetching user');
        }
        if (results.length === 0) {
            console.warn(`Login attempt failed: User not found - ${username}`); // Log warning for failed login
            return res.status(401).send('User not found');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.warn(`Login attempt failed: Incorrect password for user - ${username}`); // Log warning for incorrect password
            return res.status(401).send('Incorrect password');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`User logged in successfully: ${username}`); // Log successful login
        res.status(200).json({ token });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
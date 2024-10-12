require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Store the new user in the database
      db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err, result) => {
          if (err) {
            console.error('Error creating user:', err); // Log the error for debugging
            return res.status(500).send('Error creating user');
          }
          res.status(201).send('User created');
        }
      );
    } catch (error) {
      console.error('Error hashing password:', error); // Log the error for debugging
      res.status(500).send('Internal server error');
    }
  });  

876
// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Find the user in the database
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }

        // Check if user exists
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];

        // Check if password matches
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send('Incorrect password');
        }

        // Generate a token (you'll need to require jsonwebtoken)
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
        res.json({ token });
    });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

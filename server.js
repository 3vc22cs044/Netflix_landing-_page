const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Database Connection
const rawDb = process.env.DATABASE_URL;
if (!rawDb) throw new Error('DATABASE_URL environment variable is not set!');
const databaseUrl = rawDb.split('?')[0];
const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize Database Table
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database table initialized');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};
initDb();

// Registration Endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password, phone } = req.body;

    try {
        // "Encoding" (Hashing) the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (username, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, username',
            [username, email, hashedPassword, phone]
        );

        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Registration Error:', err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // "Decoding" (Verifying) the password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Export for Vercel serverless (no app.listen on Vercel!)
// For local dev: run with `node -e "require('./server').listen(5000)"`
module.exports = app;

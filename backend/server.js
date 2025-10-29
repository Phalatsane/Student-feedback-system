require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection and create table if it doesn't exist
(async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        studentname VARCHAR(255) NOT NULL,
        coursecode VARCHAR(50) NOT NULL,
        comments TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await client.query(createTableQuery);
    console.log('Feedback table ready');
    client.release();
  } catch (err) {
    console.error('Database error:', err);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Routes

// GET - Retrieve all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM feedback ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
});

// POST - Add new feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { studentName, courseCode, comments, rating } = req.body;

    // Validation
    if (!studentName || !courseCode || !comments || !rating) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await pool.query(
      'INSERT INTO feedback (studentname, coursecode, comments, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentName, courseCode, comments, rating]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding feedback:', err);
    res.status(500).json({ error: 'Failed to add feedback' });
  }
});

// DELETE - Remove feedback
app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM feedback WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully', feedback: result.rows[0] });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// GET - Dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM feedback');
    const avgResult = await pool.query('SELECT AVG(rating) as average FROM feedback');
    const courseResult = await pool.query(
      'SELECT coursecode, COUNT(*) as count FROM feedback GROUP BY coursecode ORDER BY count DESC'
    );

    res.json({
      totalFeedback: parseInt(totalResult.rows[0].count),
      averageRating: avgResult.rows[0].average 
        ? parseFloat(avgResult.rows[0].average).toFixed(2) 
        : '0.00',
      feedbackByCourse: courseResult.rows
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

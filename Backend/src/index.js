const express = require('express');
const cors = require('cors');

const db = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Create user
app.post('/api/user', async (req, res) => {
  const {
    Email,
    Password,
    FirstName,
    LastName,
    BirthDate,
    Gender,
    Height,
    CurrentWeight,
    DesiredWeight,
    ActiveLevelID,
    GoalID
  } = req.body;

  try {
    await db.insertUser({
      Email,
      Password,
      FirstName,
      LastName,
      BirthDate,
      Gender,
      Height,
      CurrentWeight,
      DesiredWeight,
      ActiveLevelID,
      GoalID
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('❌ Error inserting user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

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
    const result = await db.insertUser({
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

res.status(201).json({
  message: 'User created successfully',
  userId: result.insertId
});

  } catch (err) {
    console.error('❌ Error inserting user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
app.get('/api/user/:id', async (req, res) => {
  try {
    const [rows] = await db.db.promise().query(
      'SELECT * FROM `user` WHERE UserID = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error fetching user:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body; // التأكد من استقبال الحقول المرسلة من الفرونت إند

console.log("البيانات القادمة من المتصفح:", req.body);

  try {
    const user = await db.findUserByCredentials(email, password);

    if (user) {
      // نجاح: المستخدم موجود
      res.status(200).json({
        message: 'Login successful',
        user: { id: user.UserID, firstName: user.FirstName }
      });
    } else {
      // فشل: البيانات غير مطابقة
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');

const db = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('✅ NutriSense AI Backend is running');
});

// Express route
app.post('/api/user', async (req, res) => {
  const { Name, Password, Email, FirstName, LastName, BirthDate, Gender, Height, CurrentWeight,  DesiredWeight, ActiveLevelID, GoalID} = req.body;
  // هنا تحفظي البيانات في الداتابيس
  await db.insertUser({ Name, Password, Email, FirstName, LastName, BirthDate, Gender, Height, CurrentWeight,  DesiredWeight, ActiveLevelID, GoalID });
  res.status(201).json({ message: 'User created successfully' });
});

  db.query(sql, [UserID, Date, TotalCalories, Details, MealTime], (err, result) => {
    if (err) {
      console.error('❌ SQL Error:', err);
      res.status(500).json({ error: 'Database error', details: err });
    } else {
      res.status(200).json({ message: '✅ Meal added successfully', mealId: result.insertId });
    }
  });
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

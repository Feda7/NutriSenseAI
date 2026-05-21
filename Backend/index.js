process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// 🚀 Import Routes (تم التعديل لتطابق مجلد src والأسماء الجديدة)
// ==========================================
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const mealRoutes = require('./src/routes/meal.routes');
const foodRoutes = require('./src/routes/food.routes');

// ==========================================
// 🔗 Use Routes
// ==========================================
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', mealRoutes);
app.use('/api', foodRoutes);

// ==========================================
// 🧪 Test route
// ==========================================
app.get('/', (req, res) => {
  res.send('API is running cleanly with the new SRC structure! 🚀');
});

// ==========================================
// 🌍 Start Server
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});


const express = require('express');
const cors = require('cors');
const { db } = require('./config/db');
const userRoutes = require('./routes/user.routes');

const app = express();

// 1. تفعيل حزمة الـ CORS لحل أي حجب أمني بين المنافذ
app.use(cors());
app.use(express.json());

// 2. الربط المباشر والواضح للمسارات
// هذا السطر يضمن تفعيل الرابط: http://localhost:5000/api/users
app.use('/api/users', userRoutes);

// مسار فحص سريع للتأكد من عمل السيرفر
app.get('/', (req, res) => {
    res.send('NutriSense Backend is running smoothly! 🚀');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:5000`);
});
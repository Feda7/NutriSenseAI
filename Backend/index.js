process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
// استدعاء اتصال قاعدة البيانات (تأكد أن المسار يطابق مكان ملف db في مشروعك، غالباً في src/config/db)
const { db } = require('./src/config/db'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// 🚀 Import Routes
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
// 🟢 التحكم بالأنظمة الغذائية (Diets) لصفحة الأدمن
// ==========================================

// 1. جلب الأنظمة الغذائية
app.get('/api/diets', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM diettype"); 
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. إضافة نظام غذائي جديد
app.post('/api/diets', async (req, res) => {
  const { name } = req.body;
  try {
    // تم التعديل إلى Name ليطابق الـ phpMyAdmin تماماً
    await db.query("INSERT INTO diettype (Name) VALUES (?)", [name]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. حذف نظام غذائي
app.delete('/api/diets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM diettype WHERE DietTypeID = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 👥 إدارة المستخدمين (Users) لوحة التحكم
// ==========================================

// 1. جلب قائمة جميع المستخدمين
app.get('/api/admin/users', async (req, res) => {
  try {
    // ندمج الاسم الأول والأخير ليظهر كاسم كامل في الجدول
    const [rows] = await db.query("SELECT UserID, FirstName, LastName, Email, Gender FROM user"); 
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. حذف مستخدم
app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM user WHERE UserID = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 🍳 مراقبة وجبات المستخدمين (Meals Audit)
// ==========================================

// 1. جلب الوجبات المسجلة بواسطة المستخدمين مع بياناتهم
app.get('/api/admin/meals', async (req, res) => {
  try {
    // نربط جدول الـ meal مع جدول user لجلب اسم المستخدم الذي سجل الوجبة
    const query = `
      SELECT 
        m.MealID, 
        m.MealType, 
        m.TotalCalories, 
        m.Date, 
        u.FirstName, 
        u.LastName 
      FROM meal m
      LEFT JOIN user u ON m.UserID = u.UserID
      ORDER BY m.Date DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. حذف سجل وجبة
app.delete('/api/admin/meals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM meal WHERE MealID = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 📋 إدارة التقارير والتنبيهات الحقيقية (System Reports)
// ==========================================

// 1. جلب التقارير الحية مع دمج بيانات المستخدم إن وجدت
app.get('/api/admin/reports', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.ReportID, 
        r.Message, 
        r.Type,
        r.Date, 
        u.FirstName, 
        u.LastName 
      FROM report r
      LEFT JOIN user u ON r.UserID = u.UserID
      ORDER BY r.ReportID DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. حذف أو إغلاق التقرير (Dismiss)
app.delete('/api/admin/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM report WHERE ReportID = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 📊 لوحة الإحصائيات العامة (Overview Dashboard)
// ==========================================

app.get('/api/admin/overview', async (req, res) => {
  try {
    // 1. حساب عدد المستخدمين
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) as totalUsers FROM user");
    
    // 2. حساب عدد الأنظمة الغذائية
    const [[{ totalDiets }]] = await db.query("SELECT COUNT(*) as totalDiets FROM diettype");
    
    // 3. حساب عدد وجبات اليوزرز المسجلة
    const [[{ totalMeals }]] = await db.query("SELECT COUNT(*) as totalMeals FROM meal");

    // إرسال الإحصائيات مجتمعة في كائن واحد
    res.json({
      usersCount: totalUsers,
      dietsCount: totalDiets,
      mealsCount: totalMeals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// 🛠️ العمليات والأدوات السريعة (Admin Tools)
// ==========================================

// 1. أداة لإضافة مرض/حالة صحية جديدة مباشرة إلى جدول diseases
// أداة لإضافة مرض/حالة صحية جديدة مباشرة إلى جدول diseases
app.post('/api/admin/tools/diseases', async (req, res) => {
  const { diseaseName } = req.body;
  if (!diseaseName) {
    return res.status(400).json({ error: "Disease name is required" });
  }
  try {
    // تم التعديل إلى NameDis بناءً على بنية جدولك الحقيقية
    const query = "INSERT INTO diseases (NameDis) VALUES (?)";
    await db.query(query, [diseaseName]);
    res.json({ success: true, message: "New health condition added successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 2. أداة صيانة النظام: حذف كافة الوجبات المسجلة لتنظيف السجلات (تنظيف تجريبي)
app.delete('/api/admin/tools/clear-meals', async (req, res) => {
  try {
    await db.query("DELETE FROM meal");
    res.json({ success: true, message: "All system meals logs have been cleared successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// مسار تسجيل دخول الأدمن الحقيقي من جدول المستخدمين الأساسي
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  console.log("محاولة تسجيل دخول بالإيميل:", email); // لتبسيط المراقبة في الـ Terminal

  try {
    // الاستعلام من جدول user الأساسي مع مطابقة أسماء الأعمدة بدقة
    const query = "SELECT * FROM user WHERE Email = ? AND Password = ?";
    const [rows] = await db.query(query, [email, password]);

    if (rows.length > 0) {
      const loggedUser = rows[0];
      console.log("تم العثور على المستخدم بنجاح:", loggedUser.FirstName);
      
      // إصدار توكن العبور الفوري لليقظة الأمنية
      return res.json({ 
        success: true, 
        token: "admin-secure-token-2026"
      });
    } else {
      console.log("لم يتم العثور على تطابق في قاعدة البيانات!");
      return res.status(401).json({ success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة!" });
    }
  } catch (error) {
    console.error("خطأ برمي أثناء الاستعلام عن الأدمن:", error.message);
    res.status(500).json({ error: "حدث خطأ داخلي في السيرفر!" });
  }
});
// ==========================================
// 🧪 Test route
// ==========================================
app.get('/', (req, res) => {
  res.send('API is running cleanly with the new SRC structure and Diets API! 🚀');
});

// ==========================================
// 🌍 Start Server
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
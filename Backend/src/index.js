const express = require('express');
const cors = require('cors');
const { db, findUserByCredentials } = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// =============================================
// خاصية استعادة كلمة المرور - إعداد المكتبات
// =============================================
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 1. مسار طلب رابط استعادة كلمة المرور
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // التأكد من وجود المستخدم في الجدول
    const [rows] = await db.query("SELECT * FROM `user` WHERE Email = ?", [email]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'الإيميل غير موجود في النظام' });
    }

    // إنشاء رمز (Token) عشوائي ووقت انتهاء (ساعة واحدة من الآن)
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; 

    // تحديث الجدول بالرموز الجديدة
    await db.query(
      "UPDATE `user` SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE Email = ?", 
      [token, expires, email]
    );

    // إعدادات إرسال الإيميل
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dhfc397@gmail.com', // إيميلك الحقيقي
        pass: 'wmod smtl pati kfjp'    // كلمة سر التطبيقات (16 حرفاً)
      },
      // ✅ أضيفي هذا الجزء هنا لحل مشكلة الـ Certificate
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      to: email,
      subject: 'Reset Your Password - NutriSense',
      text: `لقد طلبت إعادة تعيين كلمة المرور. يرجى الضغط على الرابط التالي للبدء:\n\n 
      http://localhost:3000/reset-password?token=${token}\n\n
      هذا الرابط صالح لمدة ساعة واحدة فقط.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'تم إرسال رابط الاستعادة إلى بريدك بنجاح' });

  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إرسال الإيميل' });
  }
});

// 2. مسار استقبال كلمة المرور الجديدة وتحديثها
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const currentTime = Date.now();

  try {
    // البحث عن المستخدم بالرمز والتأكد أن الوقت لم ينتهِ
    const [rows] = await db.query(
      "SELECT * FROM `user` WHERE resetPasswordToken = ? AND resetPasswordExpires > ?", 
      [token, currentTime]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'الرابط غير صالح أو انتهت صلاحيته' });
    }

    // تحديث كلمة المرور وتصفير حقول الرموز المؤقتة
    await db.query(
      "UPDATE `user` SET Password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE resetPasswordToken = ?", 
      [newPassword, token]
    );

    res.status(200).json({ message: 'تم تحديث كلمة المرور بنجاح ✅' });

  } catch (err) {
    console.error('❌ Reset Password Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث كلمة المرور' });
  }
});
// =============================================
// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});


// =============================
// ✅ Create User + Assign Diet
// =============================
app.post('/api/user', async (req, res) => {
  try {
    const {
      FirstName,
      LastName,
      Email,
      Password,
      BirthDate,
      Gender,
      Height,
      CurrentWeight,
      DesiredWeight,
      ActiveLevelID,
      GoalID,
      DietTypeID,
      MedicalConditions // لازم يجي Array فيه Disease IDs
    } = req.body;

    // =========================
    // 1️⃣ إدخال المستخدم
    // =========================
    const [result] = await db.query(`
      INSERT INTO \`user\`
      (FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, JoinDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      FirstName,
      LastName,
      Email,
      Password,
      BirthDate,
      Gender,
      Height,
      CurrentWeight,
      DesiredWeight,
      ActiveLevelID,
      GoalID,
    ]);

    const userId = result.insertId;

    // =========================
    // 2️⃣ تخزين الأمراض في جدول UserDiseases
    // =========================
    let conditions = [];

    if (Array.isArray(MedicalConditions) && MedicalConditions.length > 0) {
      conditions = MedicalConditions;

      // حذف None لو موجود مع أمراض ثانية (نفترض ID=1 هو None)
      if (conditions.length > 1 && conditions.includes(1)) {
        conditions = conditions.filter(id => id !== 1);
      }

      for (const diseaseId of conditions) {
        await db.query(
          "INSERT INTO UserDiseases (UserID, DiseasesID) VALUES (?, ?)",
          [userId, diseaseId]
        );
      }
    }

    let dietTypeId = DietTypeID;

    // =========================
    // 3️⃣ تحديد الدايت تلقائيًا لو ما انرسل
    // =========================
    if (!dietTypeId) {

      if (!conditions.length || conditions.includes(1)) {
        dietTypeId =
          GoalID == 1 ? 4 :
          GoalID == 2 ? 2 :
          3;
      }

      else if (conditions.length >= 3) {
        dietTypeId = 6;
      }

      else if (conditions.length === 2) {
        dietTypeId = 6;
      }

      else if (conditions.length === 1) {
      const disease = conditions[0];

      if (disease == 2) dietTypeId = 6;      // Hypertension
      else if (disease == 3) dietTypeId = 4; // Diabetes
      else if (disease == 4) dietTypeId = 2; // Colon
      else if (disease == 5) dietTypeId = 5; // Cholesterol
    }

    }

    // =========================
    // 4️⃣ جلب الدايت
    // =========================
    const [dietRows] = await db.query(
      "SELECT * FROM DietType WHERE DietTypeID = ?",
      [dietTypeId]
    );

    const diet = dietRows[0];

    if (!diet) {
      return res.status(400).json({ error: "Invalid DietTypeID" });
    }

    // =========================
    // 4️⃣ حساب السعرات بطريقة علمية (BMR + Activity + Goal)
    // =========================

    // نحسب العمر من تاريخ الميلاد
    const birthDate = new Date(BirthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // 1️⃣ حساب BMR (معادلة Mifflin-St Jeor)
    let BMR;

    if (Gender === 'Male') {
      BMR = (10 * CurrentWeight) + (6.25 * Height) - (5 * age) + 5;
    } else {
      BMR = (10 * CurrentWeight) + (6.25 * Height) - (5 * age) - 161;
    }

    // 2️⃣ معامل النشاط
    let activityMultiplier = 1.2; // default

    if (ActiveLevelID == 2) activityMultiplier = 1.55;
    if (ActiveLevelID == 3) activityMultiplier = 1.725;

    // TDEE
    let dailyCalories = BMR * activityMultiplier;

    // 3️⃣ تعديل حسب الهدف
    if (GoalID == 1) {          // Lose Weight
      dailyCalories -= 500;
    } 
    else if (GoalID == 2) {     // Gain Weight
      dailyCalories += 400;
    }

    // 4️⃣ تطبيق معامل الدايت
    dailyCalories = dailyCalories * (diet.CaloriesMultiplier || 1);

    // تقريب الرقم
    dailyCalories = Math.round(dailyCalories);

    // حساب الماكروز
    const proteinTarget = Math.round(dailyCalories * diet.ProteinRatio);
    const fatTarget = Math.round(dailyCalories * diet.FatRatio);
    const carbTarget = Math.round(dailyCalories * diet.CarbRatio);


    // =========================
    // 5️⃣ تخزين الدايت للمستخدم
    // =========================
    await db.query(`
      INSERT INTO userdiettype
      (UserID, DietTypeID, StartDate, Goal, DailyCaloriesTarget, ProteinTarget, FatTarget, CarbTarget)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)
    `, [
      userId,
      dietTypeId,
      GoalID,
      dailyCalories,
      proteinTarget,
      fatTarget,
      carbTarget
    ]);

    res.status(201).json({
      message: "User created successfully",
      userId
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});



// =============================
// ✅ Get User + Diet Info (FIXED)
// =============================
app.get('/api/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const [userRows] = await db.query(
      "SELECT * FROM `user` WHERE UserID = ?",
      [userId]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userRows[0];
    // ✅ نجيب آخر دايت مضاف للمستخدم
    const [dietRows] = await db.query(`
      SELECT ud.*, d.Name
      FROM userdiettype ud
      JOIN DietType d ON ud.DietTypeID = d.DietTypeID
      WHERE ud.UserID = ?
      ORDER BY ud.StartDate DESC
      LIMIT 1
    `, [userId]);

    const diet = dietRows[0];
    // جلب الأمراض
    const [diseaseRows] = await db.query(`
      SELECT DiseasesID
      FROM UserDiseases 
      WHERE UserID = ?
    `, [userId]);

    // نحولهم إلى Array IDs
    const diseaseIDs = diseaseRows.map(d => Number(d.DiseasesID));

res.json({
  ...user,

  DietName: diet?.Name || null,
  DailyCaloriesTarget: diet?.DailyCaloriesTarget || null,
  ProteinTarget: diet?.ProteinTarget || null,
  FatTarget: diet?.FatTarget || null,
  CarbTarget: diet?.CarbTarget || null,

  DiseaseIDs: diseaseIDs
});


  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Database error" });
  }
});
// =============================
// ✅ Update User Settings
// =============================
app.put('/api/user/:id', async (req, res) => {
  const userId = req.params.id;

  const {
    FirstName,
    LastName,
    BirthDate,
    Height,
    CurrentWeight,
    DesiredWeight,
    Gender,
    GoalID,
    ActiveLevelID,
    Email,
    Password,
    Diseases
  } = req.body;

  try {

    // 1️⃣ تحديث بيانات المستخدم
    await db.query(
      `UPDATE \`user\` SET
        FirstName = ?,
        LastName = ?,
        BirthDate = ?,
        Height = ?,
        CurrentWeight = ?,
        DesiredWeight = ?,
        Gender = ?,
        GoalID = ?,
        ActiveLevelID = ?,
        Email = ?,
        Password = ?
      WHERE UserID = ?`,
      [
        FirstName,
        LastName,
        BirthDate,
        Height,
        CurrentWeight,
        DesiredWeight,
        Gender,
        GoalID,
        ActiveLevelID,
        Email,
        Password,
        userId
      ]
    );

    // 2️⃣ تحديث الأمراض
    await db.query(`DELETE FROM UserDiseases WHERE UserID = ?`, [userId]);

    if (Diseases && Diseases.length > 0) {
      for (const diseaseId of Diseases) {
        await db.query(
          `INSERT INTO UserDiseases (UserID, DiseasesID) VALUES (?, ?)`,
          [userId, diseaseId]
        );
      }
    }

    let conditions = Diseases || [];
let dietTypeId;

// لو ما عنده أمراض
if (!conditions.length || conditions.includes(1)) {
  dietTypeId =
    GoalID == 1 ? 4 :
    GoalID == 2 ? 2 :
    3;
}

// لو عنده أكثر من مرض
else if (conditions.length >= 2) {
  dietTypeId = 6;
}

// لو عنده مرض واحد
else if (conditions.length === 1) {
  const disease = conditions[0];

  if (disease == 2) dietTypeId = 6;      // Hypertension
  else if (disease == 3) dietTypeId = 4; // Diabetes
  else if (disease == 4) dietTypeId = 2; // Colon
  else if (disease == 5) dietTypeId = 5; // Cholesterol
}

// الآن نجيب الدايت
const [dietRows] = await db.query(
  `SELECT * FROM DietType WHERE DietTypeID = ?`,
  [dietTypeId]
);

const diet = dietRows[0];


    // 4️⃣ حساب العمر
    const birthDateObj = new Date(BirthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    // 5️⃣ حساب BMR
    let BMR;
    if (Gender === 'Male') {
      BMR = (10 * CurrentWeight) + (6.25 * Height) - (5 * age) + 5;
    } else {
      BMR = (10 * CurrentWeight) + (6.25 * Height) - (5 * age) - 161;
    }

    let activityMultiplier = 1.2;
    if (ActiveLevelID == 2) activityMultiplier = 1.55;
    if (ActiveLevelID == 3) activityMultiplier = 1.725;

    let dailyCalories = BMR * activityMultiplier;

    if (GoalID == 1) dailyCalories -= 500;
    if (GoalID == 2) dailyCalories += 400;

    dailyCalories = dailyCalories * (diet.CaloriesMultiplier || 1);
    dailyCalories = Math.round(dailyCalories);

    const proteinTarget = Math.round(dailyCalories * diet.ProteinRatio);
    const fatTarget = Math.round(dailyCalories * diet.FatRatio);
    const carbTarget = Math.round(dailyCalories * diet.CarbRatio);

    // 6️⃣ تحديث آخر سجل في userdiettype
    await db.query(
      `UPDATE userdiettype
        SET DailyCaloriesTarget = ?,
            ProteinTarget = ?,
            FatTarget = ?,
            CarbTarget = ?
        WHERE UserID = ?
        ORDER BY StartDate DESC
        LIMIT 1`,
      [dailyCalories, proteinTarget, fatTarget, carbTarget, userId]
    );

    res.json({ message: "User fully updated successfully ✅" });

  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});




// =============================
// ✅ Login (لم يتم التعديل عليه)
// =============================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByCredentials(email, password);

    if (user) {
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.UserID,
          firstName: user.FirstName
        }
      });
    } else {
      res.status(401).json({
        error: 'Invalid email or password'
      });
    }

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// =============================
// 🚀 Server
// =============================
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

// =============================
// ✅ Add Meal
// =============================
app.post('/api/meal', async (req, res) => {
  const { userId, mealType, totalCalories, details } = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO Meal (UserID, MealTime, Date, TotalCalories, Details)
       VALUES (?, ?, NOW(), ?, ?)`,
      [
        userId,
        mealType === 'breakfast' ? '08:00:00' :
        mealType === 'lunch' ? '13:00:00' :
        mealType === 'dinner' ? '19:00:00' : '16:00:00',
        totalCalories,
        details
      ]
    );

    res.status(201).json({ mealId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
app.get('/api/meal', (req, res) => {
  res.json({ ok: true, message: 'API is working 🎉' });
});

// =============================
// ✅ Add Fooditem
// =============================

app.post('/api/meal/item', async (req, res) => {
  const { mealId, foodItemId, quantity, totalCalories, name } = req.body;

  try {
    await db.promise().query(
      `INSERT INTO Contains (MealID, FoodItemID, Quantity, TotalCalories, Name)
       VALUES (?, ?, ?, ?, ?)`,
      [mealId, foodItemId, quantity, totalCalories, name]
    );

    res.status(201).json({ message: 'Food item added to meal' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
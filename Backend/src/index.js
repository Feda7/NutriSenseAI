const express = require('express');
const cors = require('cors');
const { db, findUserByCredentials } = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
      DietTypeID
    } = req.body;

    const [result] = await db.promise().query(`
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
      GoalID
    ]);

    const userId = result.insertId;

    let dietTypeId = DietTypeID;

    if (!dietTypeId) {
      dietTypeId =
        GoalID == 1 ? 4 :
        GoalID == 2 ? 2 :
        3;
    }

    const [dietRows] = await db.promise().query(
      "SELECT * FROM DietType WHERE DietTypeID = ?",
      [dietTypeId]
    );

    const diet = dietRows[0];

    if (!diet) {
      return res.status(400).json({ error: "Invalid DietTypeID" });
    }

    const dailyCalories =
      CurrentWeight * 30 * (diet.CaloriesMultiplier || 1);

    const proteinTarget = dailyCalories * diet.ProteinRatio;
    const fatTarget = dailyCalories * diet.FatRatio;
    const carbTarget = dailyCalories * diet.CarbRatio;

    await db.promise().query(`
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

    const [userRows] = await db.promise().query(
      "SELECT * FROM `user` WHERE UserID = ?",
      [userId]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ نجيب آخر دايت مضاف للمستخدم
    const [dietRows] = await db.promise().query(`
      SELECT ud.*, d.Name
      FROM userdiettype ud
      JOIN DietType d ON ud.DietTypeID = d.DietTypeID
      WHERE ud.UserID = ?
      ORDER BY ud.StartDate DESC
      LIMIT 1
    `, [userId]);

    const user = userRows[0];
    const diet = dietRows[0];

    res.json({
      ...user,

      // نرجع البيانات بأسماء واضحة للفرونت
      DietName: diet?.Name || null,
      DailyCaloriesTarget: diet?.DailyCaloriesTarget || null,
      ProteinTarget: diet?.ProteinTarget || null,
      FatTarget: diet?.FatTarget || null,
      CarbTarget: diet?.CarbTarget || null
    });

  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Database error" });
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

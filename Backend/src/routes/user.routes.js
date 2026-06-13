const express = require("express");
const router = express.Router();
const userController = require('../controllers/user.controller'); 
const { db } = require("../config/db");

// 🌟 الروت الرئيسي لجدول لوحة التحكم (يقوم بتحويل مسميات الأعمدة لتطابق الواجهة)
// الرابط المستهدف: http://localhost:5000/api/users
router.get("/", async (req, res) => {
  try {
    const queryText = `
      SELECT 
        UserID AS id, 
        CONCAT(FirstName, ' ', LastName) AS name, 
        Email AS email, 
        Gender AS gender 
      FROM \`user\` 
      ORDER BY UserID DESC
    `;
    
    const [rows] = await db.query(queryText);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(rows);

  } catch (error) {
    console.error("❌ Error fetching users from DB:", error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
});

// 🌟 مسار حذف مستخدم بالاعتماد على الـ id
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM `user` WHERE UserID = ?", [id]);
    res.setHeader('Content-Type', 'application/json');
    return res.json({ message: "User deleted successfully ✅" });
  } catch (error) {
    console.error("❌ Delete failed:", error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: "Delete failed" });
  }
});

// 🌟 بقية المسارات الفرعية الخاصة بالمشروع لضمان عدم انكسار الـ APIs الأخرى
router.post('/user', userController.createUser);
router.get('/user/:id', userController.getUser);
router.put('/user/:id', userController.updateUser);
router.put('/update-calories', userController.updateDailyCalories);
router.post('/verify-otp', userController.verifyOTP);
router.post('/resend-otp', userController.resendOTP);

module.exports = router;
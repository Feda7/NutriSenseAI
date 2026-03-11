
// داشبورد

const express = require("express");
const router = express.Router();

const { db } = require("../config/db");

// جلب المستخدمين
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM user");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// حذف مستخدم
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.query("DELETE FROM user WHERE UserID = ?", [id]);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// المسارات الحالية
router.post('/user', userController.createUser);
router.get('/user/:id', userController.getUser);
router.put('/user/:id', userController.updateUser);

// المسار الجديد لتحديث السعرات اليومية بناءً على حسبة النظام
// سيتم استدعاؤه من الفرونت اند عند انتهاء الحسبة
router.put('/update-calories', userController.updateDailyCalories);

module.exports = router;
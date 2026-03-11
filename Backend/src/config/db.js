const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "nutrisense_db",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * دالة للتحقق من بيانات تسجيل الدخول
 * أضفناها هنا لكي يتمكن auth.controller.js من استدعائها
 */
const findUserByCredentials = async (email, password) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM `user` WHERE Email = ? AND Password = ?", 
      [email, password]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("❌ Database Error in findUserByCredentials:", err);
    throw err;
  }
};

// تصدير db والدالة الجديدة معاً
module.exports = { 
  db, 
  findUserByCredentials 
};


const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',        // فاضية إذا ما عندك باسورد
  database: 'nutrisense_db',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL Database (nutrisense_db)');
  }
});

// دالة لإضافة مستخدم جديد
// دالة لإضافة مستخدم جديد
function insertUser(user) {
  const sql = `
    INSERT INTO \`user\`
    (FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, JoinDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  return new Promise((resolve, reject) => {
    db.query(
      sql,
      [
        user.FirstName,
        user.LastName,
        user.Email,
        user.Password,
        user.BirthDate,
        user.Gender,
        user.Height,
        user.CurrentWeight,
        user.DesiredWeight,
        user.ActiveLevelID,
        user.GoalID
      ],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

module.exports = { db, insertUser };
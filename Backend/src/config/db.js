const mysql = require('mysql2/promise');

// نستخدم Pool (أقوى وأضمن من createConnection)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nutrisense_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('✅ MySQL Pool Ready (nutrisense_db)');

async function insertUser(user) {
  const sql = `
    INSERT INTO \`user\`
    (FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, JoinDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const [result] = await db.query(sql, [
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
  ]);

  return result;
}

async function findUserByCredentials(email, password) {
  const sql = "SELECT * FROM `user` WHERE Email = ? AND Password = ?";
  const [rows] = await db.query(sql, [email, password]);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { db, insertUser, findUserByCredentials };

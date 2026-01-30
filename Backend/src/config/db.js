const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',        // خليها فاضية لأنك ما حطّيتي باسورد
  database: 'nutrisense_db', // نفس الاسم اللي في phpMyAdmin بالضبط
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL Database (nutrisense_db)');
  }
});

module.exports = db;

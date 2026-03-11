const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { db, findUserByCredentials } = require('../config/db');

// استعادة كلمة المرور
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM `user` WHERE Email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ error: 'الإيميل غير موجود في النظام' });

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; 

    await db.query(
      "UPDATE `user` SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE Email = ?", 
      [token, expires, email]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dhfc397@gmail.com',
        pass: 'wmod smtl pati kfjp' 
      },
      tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
      to: email,
      subject: 'Reset Your Password - NutriSense',
      text: `لقد طلبت إعادة تعيين كلمة المرور. يرجى الضغط على الرابط التالي للبدء:\n\n http://localhost:3000/reset-password?token=${token}\n\n هذا الرابط صالح لمدة ساعة واحدة فقط.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'تم إرسال رابط الاستعادة إلى بريدك بنجاح' });
  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إرسال الإيميل' });
  }
};

// إعادة تعيين كلمة المرور
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const currentTime = Date.now();
  try {
    const [rows] = await db.query(
      "SELECT * FROM `user` WHERE resetPasswordToken = ? AND resetPasswordExpires > ?", 
      [token, currentTime]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'الرابط غير صالح أو انتهت صلاحيته' });

    await db.query(
      "UPDATE `user` SET Password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE resetPasswordToken = ?", 
      [newPassword, token]
    );
    res.status(200).json({ message: 'تم تحديث كلمة المرور بنجاح ✅' });
  } catch (err) {
    console.error('❌ Reset Password Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث كلمة المرور' });
  }
};

// تسجيل الدخول
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 🔥 نجيب آخر دايت للمستخدم
    const [dietRows] = await db.query(`
      SELECT DietTypeID 
      FROM userdiettype 
      WHERE UserID = ?
      ORDER BY StartDate DESC
      LIMIT 1
    `, [user.UserID]);

    const dietTypeId = dietRows.length ? dietRows[0].DietTypeID : null;

    // 🔥 نرجع كل البيانات اللي يحتاجها الفرونت
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.UserID,
        firstName: user.FirstName,
        dietTypeId: dietTypeId
      }
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
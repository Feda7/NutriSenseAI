const bcrypt = require('bcrypt');
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
    // 1. استخراج بيانات المستخدم الذي صاحب هذا التوكن
    const userEmail = rows[0].Email; 

    // 2. تشفير كلمة المرور الجديدة قبل حفظها في قاعدة البيانات
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE `user` SET Password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE Email = ?", 
      [hashedPassword, userEmail]
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
    // 1. نبحث عن المستخدم بالإيميل فقط أولاً لنجلب بياناته والتشفير القديم
    const [rows] = await db.query("SELECT * FROM `user` WHERE Email = ?", [email]);
    const user = rows[0];

    // 2. التحقق من وجود المستخدم، ومقارنة كلمة السر العادية بالتشفير المحفوظ بداخل الداتا بيس
    if (!user || !(await bcrypt.compare(password, user.Password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // =========================================================
    // 🌟 التعديل الجديد: التحقق من التفعيل وإرسال كود للإيميل تلقائياً 🌟
    if (user.isVerified === 0) {
      const newOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // تحديث الكود في الداتا بيس
      await db.query("UPDATE `user` SET verificationCode = ? WHERE Email = ?", [newOtpCode, email]);

      // إرسال الكود فوراً للإيميل الحقيقي
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,               
        secure: true,            
        auth: {
          user: 'dhfc397@gmail.com',
          pass: 'ejrgagysyufzcjhl' // كود التطبيق الموحد بدون مسافات
        },  
        tls: { 
          rejectUnauthorized: false 
        }
      });

      const mailOptions = {
        from: '"NutriSenseAI" <dhfc397@gmail.com>',
        to: email,
        subject: 'Verify Your Account - NutriSenseAI',
        html: `<div style="text-align:center; font-family:sans-serif; border:1px solid #e2e8f0; padding:20px; border-radius:15px;">
                <h2 style="color:#16a34a;">NutriSenseAI</h2>
                <p>Welcome back! Please verify your account using this code:</p>
                <h1 style="font-size:40px; letter-spacing:10px; color:#1e293b;">${newOtpCode}</h1>
               </div>`
      };

      await transporter.sendMail(mailOptions);

      return res.status(403).json({ 
        unverified: true, 
        error: 'Your account is not verified yet. A new verification code has been sent to your email!' 
      });
    }
    // =========================================================

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

// وظيفة إعادة إرسال كود الـ OTP بناءً على طلب المستخدم (زر Sent Again)
exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const [userRows] = await db.query("SELECT * FROM `user` WHERE Email = ?", [email]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "الإيميل غير مسجل مسبقاً!" });
    }

    const newOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await db.query("UPDATE `user` SET verificationCode = ? WHERE Email = ?", [newOtpCode, email]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,               
      secure: true,            
      auth: {
        user: 'dhfc397@gmail.com',
        pass: 'ejrgagysyufzcjhl' // كود التطبيق الموحد بدون مسافات
      },  
      tls: { 
        rejectUnauthorized: false 
      }
    });

    const mailOptions = {
      from: '"NutriSenseAI" <dhfc397@gmail.com>',
      to: email,
      subject: 'Your New Verification Code - NutriSenseAI',
      html: `<div style="text-align:center; font-family:sans-serif; border:1px solid #e2e8f0; padding:20px; border-radius:15px;">
              <h2 style="color:#16a34a;">NutriSenseAI</h2>
              <p>Your new verification code is:</p>
              <h1 style="font-size:40px; letter-spacing:10px; color:#1e293b;">${newOtpCode}</h1>
             </div>`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "New OTP sent successfully" });

  } catch (err) {
    console.error("❌ Resend OTP Error:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر أثناء إعادة الإرسال" });
  }
};
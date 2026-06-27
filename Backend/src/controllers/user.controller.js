const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { db, findUserByCredentials } = require('../config/db');

// إنشاء مستخدم جديد وتحديد الدايت
exports.createUser = async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, DietTypeID, MedicalConditions } = req.body;

    // 1. فحص هل الإيميل موجود مسبقاً لمنع التكرار
    const [existing] = await db.query("SELECT * FROM `user` WHERE Email = ?", [Email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "هذا الإيميل مسجل مسبقاً!" });
    }

    // 2. توليد رقم OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedPassword = await bcrypt.hash(Password, 10);

    // 3. إدخال البيانات الأساسية (isVerified = 0)
    const [result] = await db.query(`
      INSERT INTO \`user\`
      (FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, JoinDate, verificationCode, isVerified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 0)
    `, [FirstName, LastName, Email, hashedPassword, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, otpCode]);

    const userId = result.insertId;

    // 4. منطق حساب الدايت والسعرات (شغل زميلتك + حفظه في الجدول الوسيط)
    let conditions = Array.isArray(MedicalConditions) ? MedicalConditions : [];
    
    // تصحيح قراءة المتغير القادم من الفرونتيند لضمان عدم انهيار الكود
    let DietTypeIDComputed = DietTypeID || (conditions.length >= 2 ? 6 : (GoalID == 1 ? 4 : 2));
    
    const [dietRows] = await db.query("SELECT * FROM DietType WHERE DietTypeID = ?", [DietTypeIDComputed]);
    const diet = dietRows[0] || { CaloriesMultiplier: 1 };

    const age = new Date().getFullYear() - new Date(BirthDate).getFullYear();
    let BMR = Gender === 'Male' ? (10 * CurrentWeight) + (6.25 * Height) - (5 * age) + 5 : (10 * CurrentWeight) + (6.25 * Height) - (5 * age) - 161;
    let activityMultiplier = ActiveLevelID == 2 ? 1.55 : 1.2;
    let dailyCalories = Math.round((BMR * activityMultiplier) * (diet?.CaloriesMultiplier || 1));

    // حساب نسب المغذيات بناءً على الـ Ratios للدايت المختار لتخزينها في الجدول الوسيط
    const proteinTarget = Math.round(dailyCalories * (diet.ProteinRatio || 0.25));
    const fatTarget = Math.round(dailyCalories * (diet.FatRatio || 0.25));
    const carbTarget = Math.round(dailyCalories * (diet.CarbRatio || 0.50));

    // تحديث السعرات في جدول المستخدم الأساسي
    await db.query("UPDATE `user` SET DailyCalories = ? WHERE UserID = ?", [dailyCalories, userId]);
    
    // 🚀 [إضافة جديدة]: إدخال الصف الأول في الجدول الوسيط للدايت (userdiettype) ليرتبط بالمستخدم فوراً
    await db.query(`
      INSERT INTO userdiettype (UserID, DietTypeID, DailyCaloriesTarget, ProteinTarget, FatTarget, CarbTarget, StartDate)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [userId, DietTypeIDComputed, dailyCalories, proteinTarget, fatTarget, carbTarget]);

    // حفظ الأمراض في قاعدة البيانات
    for (const diseaseId of conditions) {
      await db.query("INSERT INTO UserDiseases (UserID, DiseasesID) VALUES (?, ?)", [userId, diseaseId]);
    }

    // 5. إعداد وإرسال الإيميل
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,              
      secure: true,            
      auth: {
        user: 'dhfc397@gmail.com',
        pass: 'ejrgagysyufzcjhl' 
      },  
      tls: { 
        rejectUnauthorized: false // 👈 هذا السطر السحري الذي يضمن خروج الإيميل فوراً دون حجب من جوجل
      }
    });

    const mailOptions = {
      from: '"NutriSenseAI" <dhfc397@gmail.com>',
      to: Email,
      subject: 'Verify Your NutriSenseAI Account',
      html: `<div style="text-align:center; font-family:sans-serif; border:1px solid #e2e8f0; padding:20px; border-radius:15px;">
              <h2 style="color:#16a34a;">NutriSenseAI</h2>
              <p>Your verification code is:</p>
              <h1 style="font-size:40px; letter-spacing:10px; color:#1e293b;">${otpCode}</h1>
            </div>`
    };

    // محاولة الإرسال داخل try/catch صغيرة لضمان عدم توقف السيرفر
    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully");
    } catch (mailError) {
        console.log("⚠️ Mail failed but continuing for testing...", mailError.message);
    }
    
    // إرسال الرد النهائي للـ Vue لتظهر النافذة الخضراء
    return res.status(200).json({ success: true, message: "OTP Sent" });

  } catch (err) {
    console.error("❌ Critical Error:", err);
    res.status(500).json({ error: "حدث خطأ في السيرفر" });
  }
};
// جلب بيانات المستخدم
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const [userRows] = await db.query("SELECT * FROM `user` WHERE UserID = ?", [userId]);
    if (!userRows.length) return res.status(404).json({ message: "User not found" });

    const user = userRows[0];
    const [dietRows] = await db.query(`
      SELECT ud.*, d.Name FROM userdiettype ud
      JOIN DietType d ON ud.DietTypeID = d.DietTypeID
      WHERE ud.UserID = ? ORDER BY ud.StartDate DESC LIMIT 1
    `, [userId]);
    const diet = dietRows[0];

    const [diseaseRows] = await db.query("SELECT DiseasesID FROM UserDiseases WHERE UserID = ?", [userId]);
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
};

// تحديث بيانات المستخدم
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { FirstName, LastName, BirthDate, Height, CurrentWeight, DesiredWeight, Gender, GoalID, ActiveLevelID, Email, Password, Diseases } = req.body;

  try {
    await db.query(`
      UPDATE \`user\` SET FirstName = ?, LastName = ?, BirthDate = ?, Height = ?, CurrentWeight = ?, DesiredWeight = ?, Gender = ?, GoalID = ?, ActiveLevelID = ?, Email = ?, Password = ? WHERE UserID = ?`,
      [FirstName, LastName, BirthDate, Height, CurrentWeight, DesiredWeight, Gender, GoalID, ActiveLevelID, Email, Password, userId]
    );

    await db.query(`DELETE FROM UserDiseases WHERE UserID = ?`, [userId]);
    if (Diseases && Diseases.length > 0) {
      for (const diseaseId of Diseases) {
        await db.query(`INSERT INTO UserDiseases (UserID, DiseasesID) VALUES (?, ?)`, [userId, diseaseId]);
      }
    }

    let conditions = Diseases || [];
    let dietTypeId;

    if (!conditions.length || conditions.includes(1)) {
      dietTypeId = GoalID == 1 ? 4 : GoalID == 2 ? 2 : 3;
    } else if (conditions.length >= 2) {
      dietTypeId = 6;
    } else if (conditions.length === 1) {
      const disease = conditions[0];
      if (disease == 2) dietTypeId = 6;
      else if (disease == 3) dietTypeId = 4;
      else if (disease == 4) dietTypeId = 2;
      else if (disease == 5) dietTypeId = 5;
    }

    const [dietRows] = await db.query(`SELECT * FROM DietType WHERE DietTypeID = ?`, [dietTypeId]);
    const diet = dietRows[0];

    const birthDateObj = new Date(BirthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    if (today.getMonth() - birthDateObj.getMonth() < 0 || (today.getMonth() - birthDateObj.getMonth() === 0 && today.getDate() < birthDateObj.getDate())) age--;

    let BMR = Gender === 'Male' ? (10 * CurrentWeight) + (6.25 * Height) - (5 * age) + 5 : (10 * CurrentWeight) + (6.25 * Height) - (5 * age) - 161;
    let activityMultiplier = ActiveLevelID == 2 ? 1.55 : ActiveLevelID == 3 ? 1.725 : 1.2;
    
    let dailyCalories = BMR * activityMultiplier;
    if (GoalID == 1) dailyCalories -= 500;
    if (GoalID == 2) dailyCalories += 400;

    dailyCalories = Math.round(dailyCalories * (diet.CaloriesMultiplier || 1));
    const proteinTarget = Math.round(dailyCalories * diet.ProteinRatio);
    const fatTarget = Math.round(dailyCalories * diet.FatRatio);
    const carbTarget = Math.round(dailyCalories * diet.CarbRatio);

    await db.query(`
      UPDATE userdiettype SET DailyCaloriesTarget = ?, ProteinTarget = ?, FatTarget = ?, CarbTarget = ? WHERE UserID = ? ORDER BY StartDate DESC LIMIT 1`,
      [dailyCalories, proteinTarget, fatTarget, carbTarget, userId]
    );

    await db.query("UPDATE \`user\` SET DailyCalories = ? WHERE UserID = ?", [dailyCalories, userId]);
    res.json({ message: "User fully updated successfully ✅" });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// في ملف user.controller.js أو auth.controller.js
exports.updateDailyCalories = async (req, res) => {
    const { userId, calories } = req.body;

    try {
        // تحديث العمود DailyCalories بناءً على UserID
        const [result] = await db.query(
            "UPDATE user SET DailyCalories = ? WHERE UserID = ?",
            [calories, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ 
            success: true, 
            message: "Daily calories updated successfully in database!" 
        });
    } catch (error) {
        console.error("Update Calories Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
// وظيفة التحقق من الكود (OTP)
exports.verifyOTP = async (req, res) => {
  const { email, code } = req.body;
  try {
    const [user] = await db.query("SELECT * FROM `user` WHERE Email = ? AND verificationCode = ?", [email, code]);
    if (user.length > 0) {
      await db.query("UPDATE `user` SET isVerified = 1, verificationCode = NULL WHERE Email = ?", [email]);
    res.json({
      success: true,
      message: "Account verified!",
      user: {
        id: user[0].UserID,
        firstName: user[0].FirstName
      }
});    } else {
      res.status(400).json({ success: false, message: "Invalid code" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

 // وظيفة إعادة إرسال كود الـ OTP فقط دون إنشاء حساب جديد
exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    // التأكد من وجود المستخدم في قاعدة البيانات
    const [userRows] = await db.query("SELECT * FROM `user` WHERE Email = ?", [email]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "الإيميل غير مسجل!" });
    }

    // توليد كود جديد وتحديثه في قاعدة البيانات
    const newOtpCode = Math.floor(1000 + Math.random() * 9000).toString();
    await db.query("UPDATE `user` SET verificationCode = ? WHERE Email = ?", [newOtpCode, email]);

    // إعداد الـ Transporter باستخدام كود التطبيق الجديد النظيف الخاص بكِ
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,               
      secure: true,            
      auth: {
        user: 'dhfc397@gmail.com',
        pass: 'ejrgagysyufzcjhl' 
      },  
      tls: { 
        rejectUnauthorized: false // 👈 هذا السطر السحري الذي يضمن خروج الإيميل فوراً دون حجب من جوجل
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

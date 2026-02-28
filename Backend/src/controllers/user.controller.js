const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { db, findUserByCredentials } = require('../config/db');

// إنشاء مستخدم جديد وتحديد الدايت
exports.createUser = async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, DietTypeID, MedicalConditions } = req.body;

    const [result] = await db.query(`
      INSERT INTO \`user\`
      (FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID, JoinDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [FirstName, LastName, Email, Password, BirthDate, Gender, Height, CurrentWeight, DesiredWeight, ActiveLevelID, GoalID]);

    const userId = result.insertId;
    let conditions = [];

    if (Array.isArray(MedicalConditions) && MedicalConditions.length > 0) {
      conditions = MedicalConditions;
      if (conditions.length > 1 && conditions.includes(1)) {
        conditions = conditions.filter(id => id !== 1);
      }
      for (const diseaseId of conditions) {
        await db.query("INSERT INTO UserDiseases (UserID, DiseasesID) VALUES (?, ?)", [userId, diseaseId]);
      }
    }

    let dietTypeId = DietTypeID;
    if (!dietTypeId) {
      if (!conditions.length || conditions.includes(1)) {
        dietTypeId = GoalID == 1 ? 4 : GoalID == 2 ? 2 : 3;
      } else if (conditions.length >= 3 || conditions.length === 2) {
        dietTypeId = 6;
      } else if (conditions.length === 1) {
        const disease = conditions[0];
        if (disease == 2) dietTypeId = 6;     
        else if (disease == 3) dietTypeId = 4; 
        else if (disease == 4) dietTypeId = 2; 
        else if (disease == 5) dietTypeId = 5; 
      }
    }

    const [dietRows] = await db.query("SELECT * FROM DietType WHERE DietTypeID = ?", [dietTypeId]);
    const diet = dietRows[0];
    if (!diet) return res.status(400).json({ error: "Invalid DietTypeID" });

    const birthDate = new Date(BirthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

    let BMR;
    if (Gender === 'Male') BMR = (10 * CurrentWeight) + (6.25 * Height) - (5 * age) + 5;
    else BMR = (10 * CurrentWeight) + (6.25 * Height) - (5 * age) - 161;

    let activityMultiplier = 1.2; 
    if (ActiveLevelID == 2) activityMultiplier = 1.55;
    if (ActiveLevelID == 3) activityMultiplier = 1.725;

    let dailyCalories = BMR * activityMultiplier;
    if (GoalID == 1) dailyCalories -= 500;
    else if (GoalID == 2) dailyCalories += 400;

    dailyCalories = Math.round(dailyCalories * (diet.CaloriesMultiplier || 1));
    const proteinTarget = Math.round(dailyCalories * diet.ProteinRatio);
    const fatTarget = Math.round(dailyCalories * diet.FatRatio);
    const carbTarget = Math.round(dailyCalories * diet.CarbRatio);

    await db.query(`
      INSERT INTO userdiettype
      (UserID, DietTypeID, StartDate, Goal, DailyCaloriesTarget, ProteinTarget, FatTarget, CarbTarget)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)
    `, [userId, dietTypeId, GoalID, dailyCalories, proteinTarget, fatTarget, carbTarget]);

    res.status(201).json({ message: "User created successfully", userId });
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Database error" });
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

    res.json({ message: "User fully updated successfully ✅" });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

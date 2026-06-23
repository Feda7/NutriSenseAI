const { db } = require('../config/db');

// دالة مساعدة لتوليد تاريخ اليوم الحالي بتنسيق YYYY-MM-DD الثابت لتجنب فروقات الـ Timezone
const getTodayDateString = () => {
  return new Date().toISOString().slice(0, 10);
};

// 1. إنشاء وجبة جديدة (يدوياً)
exports.createMeal = async (req, res) => {
  const { userId, mealType } = req.body; 
  try {
    const now = new Date();
    const mealTime = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0') + ':' + 
                    now.getSeconds().toString().padStart(2, '0');
    
    const todayDate = getTodayDateString();

    const [result] = await db.query(
      `INSERT INTO meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
       VALUES (?, ?, ?, ?, 0, 0, 0, 0)`, 
      [userId, mealType, mealTime, todayDate]
    );
    
    res.status(201).json({ message: "Meal created successfully", mealId: result.insertId });
  } catch (err) {
    console.error("Create Meal Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

// 2. إضافة صنف طعام إلى وجبة منشأة مسبقاً
exports.addFoodToMeal = async (req, res) => {
  const { mealId, foodItemId, quantity, unitId } = req.body;

  try {
    // جلب بيانات الصنف
    const [foodRows] = await db.query("SELECT Calories, Protein, Carbs, Fat FROM fooditem WHERE FoodItemID = ?", [foodItemId]);
    
    if (!foodRows.length) {
      return res.status(404).json({ error: "Food item not found" });
    }

    // جلب معامل التحويل للجرام
    const [unitRows] = await db.query(
      "SELECT ToGramFact FROM fooditemservingunit WHERE foodItemId = ? AND UnitID = ?", 
      [foodItemId, unitId]
    );
    
    const toGram = unitRows.length > 0 ? unitRows[0].ToGramFact : 1; 
    const factor = (quantity * toGram / 100);
    
    // حساب القيم المضافة حديثاً
    const cal = parseFloat((factor * (foodRows[0].Calories || 0)).toFixed(2));
    const pro = parseFloat((factor * (foodRows[0].Protein || 0)).toFixed(2));
    const carb = parseFloat((factor * (foodRows[0].Carbs || 0)).toFixed(2));
    const fat = parseFloat((factor * (foodRows[0].Fat || 0)).toFixed(2));

    // الفحص قبل الإدخال لمنع خطأ Duplicate Entry
    const [existingItems] = await db.query(
      "SELECT Quantity, TotalCalories FROM mealfooditem WHERE MealID = ? AND foodItemId = ?",
      [mealId, foodItemId]
    );

    if (existingItems.length > 0) {
      // الصنف موجود مسبقاً في الوجبة -> تحديث الكمية والسعرات
      await db.query(
        `UPDATE mealfooditem SET 
           Quantity = Quantity + ?, 
           TotalCalories = TotalCalories + ? 
         WHERE MealID = ? AND foodItemId = ?`,
        [quantity, cal, mealId, foodItemId]
      );
    } else {
      // الصنف غير موجود -> سجل جديد لأول مرة
      await db.query(
        `INSERT INTO mealfooditem (MealID, foodItemId, Quantity, UnitID, TotalCalories) VALUES (?, ?, ?, ?, ?)`, 
        [mealId, foodItemId, quantity, unitId, cal]
      );
    }

    // تحديث الإجمالي التراكمي في جدول الوجبة الأساسي (meal)
    await db.query(
      `UPDATE meal SET 
         TotalCalories = COALESCE(TotalCalories, 0) + ?, 
         TotalProtein = COALESCE(TotalProtein, 0) + ?, 
         TotalCarbs = COALESCE(TotalCarbs, 0) + ?, 
         TotalFat = COALESCE(TotalFat, 0) + ? 
       WHERE MealID = ?`, 
      [cal, pro, carb, fat, mealId]
    );

    res.status(201).json({ message: "Success", addedCalories: cal });
  } catch (err) {
    console.error("❌ Add Food To Meal Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// 3. جلب تفاصيل وجبة محددة مع عناصرها
exports.getMeal = async (req, res) => {
  const { mealId } = req.params;
  try {
    const [mealRows] = await db.query("SELECT * FROM meal WHERE MealID = ?", [mealId]);
    if (!mealRows.length) return res.status(404).json({ error: "Meal not found" });

    const query = `
      SELECT 
          f.Name AS name, 
          mfi.Quantity AS quantity, 
          su.ShortCode AS unit, 
          mfi.TotalCalories AS totalCalories,
          ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Protein, 0), 2) AS protein,
          ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Carbs, 0), 2) AS carbs,
          ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Fat, 0), 2) AS fat
      FROM mealfooditem mfi 
      JOIN fooditem f ON mfi.foodItemId = f.FoodItemID 
      JOIN servingunit su ON mfi.UnitID = su.UnitID
      WHERE mfi.MealID = ?
    `;
    const [items] = await db.query(query, [mealId]);

    res.json({ meal: mealRows[0], items: items });
  } catch (err) {
    console.error("Get Meal Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// 4. جلب وجبات وعناصر اليوم الحالي للمستخدم (المسؤولة عن حساب وعرض السعرات التراكمية بالهوم)
exports.getTodayMeals = async (req, res) => {
  const { userId } = req.params;
  try {
    const todayDate = getTodayDateString(); 

    const [meals] = await db.query(
      `SELECT MealID, MealType, TotalCalories FROM meal WHERE UserID = ? AND Date = ?`, 
      [userId, todayDate]
    );

    const mealData = await Promise.all(meals.map(async meal => {
      const [items] = await db.query(`
        SELECT f.Name AS name, mfi.TotalCalories AS totalCalories, 
              f.Protein AS protein, f.Carbs AS carbs, f.Fat AS fat, 
              f.Fiber AS fiber, f.Sodium AS sodium, f.Cholesterol AS cholesterol
        FROM mealfooditem mfi 
        JOIN fooditem f ON mfi.foodItemId = f.FoodItemID 
        WHERE mfi.MealID = ?`, [meal.MealID]
      );
      
      return { 
        mealId: meal.MealID, 
        mealType: meal.MealType, 
        totalCalories: meal.TotalCalories || 0, // 👈 صيغة الحرف الصغير (الأرجح أن الفرونت إند يطلبها)
        TotalCalories: meal.TotalCalories || 0, // 👈 صيغة الحرف الكبير كاحتياط
        items 
      };
    }));
    res.json(mealData);
  } catch (err) {
    console.error("Get Today's Meals Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};
// 5. جلب اقتراحات عشوائية لصفحة الهوم الفرونت إند
exports.getHomeData = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        FoodItemID AS id, 
        Name AS temp_name, 
        Calories AS temp_calories, 
        Protein AS temp_protein, 
        Carbs AS temp_carb, 
        Fat AS temp_fat,
        ModelLabel AS temp_image
       FROM fooditem 
       ORDER BY RAND() 
       LIMIT 6`
    );
    return res.json(rows);
  } catch (err) {
    console.error("❌ Home Data Error:", err);
    return res.status(500).json({ error: 'Failed to fetch home data suggestions' });
  }
};

// 6. إضافة وجبة مقترحة مباشرة بضغطة زر وتحديث السعرات بنفس توقيت الجلب الموحد
exports.addSuggestedMeal = async (req, res) => {
  const { userId, mealType, foodItemId } = req.body;
  
  console.log("📝 Backend received suggested meal request:", { userId, mealType, foodItemId });

  try {
    const [foodRows] = await db.query('SELECT * FROM fooditem WHERE FoodItemID = ?', [foodItemId]);
    
    if (foodRows.length === 0) {
      return res.status(404).json({ error: 'Suggested food item not found' });
    }

    const food = foodRows[0]; 
    const calories = food.Calories || food.calories || 0;
    const protein = food.Protein || food.protein || 0;
    const carbs = food.Carbs || food.carbs || food.carb || 0;
    const fat = food.Fat || food.fat || 0;

    const now = new Date();
    const mealTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0') + ':00';
    
    const todayDate = getTodayDateString(); 

    // إدخال الوجبة الرئيسية بالتاريخ الموحد المتناسق مع دالة الجلب
    const [mealResult] = await db.query(
      `INSERT INTO meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, mealType, mealTime, todayDate, calories, protein, carbs, fat]
    );

    const mealId = mealResult.insertId;

    // الربط في جدول mealfooditem وضبط مسمى العمود ليكون متناسقاً (foodItemId)
    await db.query(
      `INSERT INTO mealfooditem (MealID, foodItemId, Quantity, UnitID, TotalCalories) VALUES (?, ?, 1, 1, ?)`,
      [mealId, foodItemId, calories]
    );

    console.log("✅ Suggested meal logged successfully! MealID:", mealId);
    return res.status(201).json({ message: 'Suggested meal logged successfully!' });

  } catch (err) {
    console.error("❌ SQL Error details inside addSuggestedMeal:", err.message); 
    return res.status(500).json({ error: 'Database error occurred', details: err.message });
  }
};

// 7. جلب بيانات التقدم والرسوم البيانية للمستخدم
exports.getProgressData = async (req, res) => {
    const { userId } = req.params;
    try {
        const [userStats] = await db.query(`SELECT CurrentWeight, JoinDate FROM user WHERE UserID = ?`, [userId]);
        if (userStats.length === 0) return res.status(404).json({ error: "User not found" });

        const [todayTotals] = await db.query(`
            SELECT 
                CAST(IFNULL(SUM(TotalCalories), 0) AS DECIMAL(10,2)) as totalCalories,
                CAST(IFNULL(SUM(TotalProtein), 0) AS DECIMAL(10,2)) as totalProtein,
                CAST(IFNULL(SUM(TotalCarbs), 0) AS DECIMAL(10,2)) as totalCarbs,
                CAST(IFNULL(SUM(TotalFat), 0) AS DECIMAL(10,2)) as totalFat
            FROM meal 
            WHERE UserID = ? AND DATE(Date) = CURRENT_DATE()
        `, [userId]);

        const [history] = await db.query(`
            SELECT 
                DATE_FORMAT(Date, '%Y-%m-%d') as date, 
                CAST(SUM(TotalCalories) AS DECIMAL(10,2)) as calories, 
                CAST(SUM(TotalProtein) AS DECIMAL(10,2)) as protein, 
                CAST(SUM(TotalCarbs) AS DECIMAL(10,2)) as carbs, 
                CAST(SUM(TotalFat) AS DECIMAL(10,2)) as fat
            FROM meal 
            WHERE UserID = ? 
            GROUP BY DATE(Date) 
            ORDER BY DATE(Date) DESC LIMIT 30
        `, [userId]);

        res.json({ goals: userStats[0], today: todayTotals[0], history: history });
    } catch (err) {
        console.error("Progress Data Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 8. جلب كل الوجبات المسجلة في النظام (لوحة الإدارة مثلاً)
exports.getMeals = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM meal");
    res.json(rows);
  } catch (error) {
    console.error("Fetch All Meals Error:", error);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
};

// 9. حذف وجبة معينة
exports.deleteMeal = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM meal WHERE MealID = ?", [id]);
    res.json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("Delete Meal Error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
};

// 10. تسجيل وجبة جديدة تم التعرف عليها بواسطة الذكاء الاصطناعي (AI Model)
exports.addMealByAIName = async (req, res) => {
  const { userId, mealType, modelLabel } = req.body;

  try {
    const formattedLabel = modelLabel.replace(/_/g, ' ');

    // جلب السجل بالبحث المرن
    const [foodRows] = await db.query(
      `SELECT * FROM fooditem 
       WHERE ModelLabel = ? OR ModelLabel = ? OR Name = ? OR Name = ? LIMIT 1`, 
      [modelLabel, formattedLabel, modelLabel, formattedLabel]
    );

    let foodItemId = 1; 
    let cal = 400;
    let pro = 25;
    let carb = 45;
    let fat = 10;
    let foodRealName = formattedLabel; 

    // مطابقة المسميات من الداتابيس
    if (foodRows.length) {
      const row = foodRows[0];
      
      foodItemId = row.FoodItemID || row.Fooditemid || row.fooditemid || row.id || 1;
      foodRealName = row.Name || row.name || formattedLabel;
      
      cal = parseFloat(row.Calories || row.calories || 0);
      pro = parseFloat(row.Protein || row.protein || 0);
      carb = parseFloat(row.Carbs || row.carbs || row.carb || 0);
      fat = parseFloat(row.Fat || row.fat || 0);
      
      console.log(`✅ [AI Database Match] Found item: ${foodRealName}, ID: ${foodItemId}`);
    }

    const now = new Date();
    const mealTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0') + ':' + 
                     now.getSeconds().toString().padStart(2, '0');

    const todayDate = getTodayDateString();

    // إدخال الوجبة الرئيسية في جدول meal بالتاريخ الموحد
    const [mealResult] = await db.query(
      `INSERT INTO meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [userId, mealType, mealTime, todayDate, cal, pro, carb, fat]
    );

    const mealId = mealResult.insertId;

    // الربط في جدول mealfooditem المتناسق
    await db.query(
      `INSERT INTO mealfooditem (MealID, foodItemId, Quantity, UnitID, TotalCalories) VALUES (?, ?, 1, 1, ?)`, 
      [mealId, foodItemId, cal]
    );

    return res.status(201).json({ 
      message: `AI successfully recognized and registered your ${foodRealName}! 🎉`,
      foodName: foodRealName,
      mealId: mealId,
      foodItemId: foodItemId
    });

  } catch (err) {
    console.error("❌ AI Meal Logging Database Error:", err);
    return res.status(500).json({ error: 'Database error occurred while saving AI meal' });
  }
};
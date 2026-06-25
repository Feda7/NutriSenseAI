const { db } = require('../config/db');

exports.createMeal = async (req, res) => {
  const { userId, mealType } = req.body; 
  try {
    const now = new Date();
    const mealTime = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0') + ':' + 
                    now.getSeconds().toString().padStart(2, '0');
    
    const [result] = await db.query(
      `INSERT INTO meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
       VALUES (?, ?, ?, CURDATE(), 0, 0, 0, 0)`, 
      [userId, mealType, mealTime]
    );
    
    res.status(201).json({ message: "Meal created successfully", mealId: result.insertId });
  } catch (err) {
    console.error("Create Meal Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.addFoodToMeal = async (req, res) => {
  const { mealId, foodItemId, quantity, unitId } = req.body;
  // تأمين معرف الأكلة سواء جاء باسم id أو foodItemId من الفرونت إند

  try {
    // 1. جلب بيانات الصنف
    const [foodRows] = await db.query("SELECT Calories, Protein, Carbs, Fat FROM fooditem WHERE FoodItemID = ?", [foodItemId]);
    
    if (!foodRows.length) {
      return res.status(404).json({ error: "Food item not found" });
    }

    // 2. جلب معامل التحويل للجرام
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

    // ✨ 3. الفحص قبل الإدخال لمنع خطأ Duplicate Entry
    const [existingItems] = await db.query(
      "SELECT Quantity, TotalCalories FROM mealfooditem WHERE MealID = ? AND foodItemId = ?",
      [mealId, foodItemId]
    );

    if (existingItems.length > 0) {
      // الصنف موجود مسبقاً في الوجبة -> نقوم بتحديث الكمية والسعرات فقط
      await db.query(
        `UPDATE mealfooditem SET 
          Quantity = Quantity + ?, 
          TotalCalories = TotalCalories + ? 
        WHERE MealID = ? AND foodItemId = ?`,
        [quantity, cal, mealId, foodItemId]
      );
    } else {
      // الصنف غير موجود -> نقوم بإدخاله كـ سجل جديد لأول مرة
      await db.query(
        `INSERT INTO mealfooditem (MealID, foodItemId, Quantity, UnitID, TotalCalories) VALUES (?, ?, ?, ?, ?)`, 
        [mealId, foodItemId, quantity, unitId, cal]
      );
    }

    // 4. تحديث الإجمالي التراكمي في جدول الوجبة الأساسي (meal)
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
        -- حساب الماكروز ديناميكياً بناءً على نسبة السعرات الإجمالية إلى السعرات الأساسية لكل 100 جرام
        ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Protein, 0), 2) AS protein,
        ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Carbs, 0), 2) AS carbs,
        ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Fat, 0), 2) AS fat
    FROM mealfooditem mfi 
    JOIN fooditem f ON mfi.FoodItemID = f.FoodItemID 
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

// في ملف الباك إند:
exports.getTodayMeals = async (req, res) => {
  const { userId } = req.params;
  try {
    const [meals] = await db.query(
      `SELECT MealID, MealType, TotalCalories FROM meal WHERE UserID = ? AND Date = CURDATE()`, 
      [userId]
    );

    const mealData = await Promise.all(meals.map(async meal => {
      // 🌟 هذا هو الاستعلام الذي يحتاج للتعديل:
      const [items] = await db.query(`
        SELECT 
            mfi.FoodItemID AS foodItemId, 
            f.Name AS name, 
            mfi.TotalCalories AS totalCalories, 
            mfi.Quantity AS quantity, 
            mfi.UnitID AS unitId,
            -- الحساب الديناميكي للماكروز
            ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Protein, 0), 2) AS protein,
            ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Carbs, 0), 2) AS carbs,
            ROUND(IF(f.Calories > 0, (mfi.TotalCalories / f.Calories) * f.Fat, 0), 2) AS fat
        FROM mealfooditem mfi 
        JOIN fooditem f ON mfi.FoodItemID = f.FoodItemID 
        WHERE mfi.MealID = ?`, [meal.MealID]
      );
      
      return { 
        mealId: meal.MealID, 
        mealType: meal.MealType, 
        items 
      };
    }));
    
    res.json(mealData);
  } catch (err) {
    console.error("Get Today's Meals Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};
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
       ORDER BY RAND() \n` +
      '       LIMIT 6'
    );
    return res.json(rows);
  } catch (err) {
    console.error("❌ Home Data Error:", err);
    return res.status(500).json({ error: 'Failed to fetch home data suggestions' });
  }
};

exports.addSuggestedMeal = async (req, res) => {
  const { userId, mealType, foodItemId } = req.body;
  try {
    const [foodRows] = await db.query('SELECT * FROM fooditem WHERE FoodItemID = ?', [foodItemId]);
    if (foodRows.length === 0) {
      return res.status(404).json({ error: 'Suggested food item not found' });
    }

    const food = foodRows;
    const now = new Date();
    const mealTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':00';

    const [mealResult] = await db.query(
      `INSERT INTO meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [userId, mealType, mealTime, food.Calories, food.Protein, food.Carbs, food.Fat]
    );

    const mealId = mealResult.insertId;

    await db.query(
      'INSERT INTO mealfooditem (MealID, FooditemID, Quantity, UnitID, TotalCalories) VALUES (?, ?, 1, 1, ?)',
      [mealId, foodItemId, food.Calories]
    );

    return res.status(201).json({ message: 'Suggested meal logged successfully!' });
  } catch (err) {
    console.error("❌ Add Suggested Error:", err);
    return res.status(500).json({ error: 'Failed to log suggested meal' });
  }
};
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
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// 1. جلب كل الوجبات 
exports.getMeals = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM meal");
    res.json(rows);
  } catch (error) {
    console.error("Fetch All Meals Error:", error);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
};

// 2. حذف وجبة معينة
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
exports.addMealByAIName = async (req, res) => {
  const { userId, mealType, modelLabel } = req.body;

  try {
    const formattedLabel = modelLabel.replace(/_/g, ' ');

    // 1. جلب السجل بالبحث المرن
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
    let foodRealName = formattedLabel; // حفظ اسم الأكلة الحقيقي لإرجاعه للتنبيه

    // 2. مطابقة المسميات من الداتابيس
    if (foodRows.length) {
      const row = foodRows[0];
      
      // مطابقة مرنة للمعرف بناء على صورة الجدول الحقيقية
      foodItemId = row.FooditemID || row.FoodItemID || row.fooditemid || row.id || 1;
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

    // 3. إدخال الوجبة الرئيسية في جدول meal
    const [mealResult] = await db.query(
      `INSERT INTO meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?)`, 
      [userId, mealType, mealTime, cal, pro, carb, fat]
    );

    const mealId = mealResult.insertId;

    // 4. الربط في جدول mealfooditem المطابق تماماً لـ image_00e101.png بحرف i سمول
    await db.query(
      `INSERT INTO mealfooditem (MealID, FooditemID, Quantity, UnitID, TotalCalories) VALUES (?, ?, 1, 1, ?)`, 
      [mealId, foodItemId, cal]
    );

    // إرسال اسم الأكل الحقيقي (foodRealName) في الاستجابة للفرونت إند لطباعته في الـ Alert
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
// 1. دالة حذف أكلة من الوجبة
exports.deleteFoodFromMeal = async (req, res) => {
    try {
        const { mealId, foodItemId } = req.params;
        
        await db.query(
            'DELETE FROM mealfooditem WHERE MealID = ? AND foodItemId = ?', // 👈 تم تعديلها إلى i صغيرة
            [mealId, foodItemId]
        );
        
        res.status(200).json({ message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('❌ Delete Food Error:', error);
        res.status(500).json({ error: 'An error occurred while deleting the food item' });
    }
};

// 2. دالة تعديل الكمية أو الوحدة لأكلة مضافة مسبقاً
exports.updateFoodInMeal = async (req, res) => {
    try {
        const { mealId, foodItemId } = req.params;
        const { quantity, unitId } = req.body;

        // 1. جلب بيانات الأكلة الأساسية و معامل التحويل
        const [food] = await db.query('SELECT Calories, Protein, Carbs, Fat FROM fooditem WHERE FoodItemID = ?', [foodItemId]);
        const [unit] = await db.query('SELECT ToGramFact FROM fooditemservingunit WHERE foodItemId = ? AND UnitID = ?', [foodItemId, unitId]);

        // 2. جلب القيم القديمة المسجلة في جدول الوجبة لكي نحسب الفارق
        const [oldItem] = await db.query('SELECT TotalCalories FROM mealfooditem WHERE MealID = ? AND foodItemId = ?', [mealId, foodItemId]);
        
        if (!food.length || !unit.length || !oldItem.length) {
            return res.status(404).json({ error: 'Data not found' });
        }

        const oldCalories = parseFloat(oldItem[0].TotalCalories);

        // 3. حساب القيم الجديدة
        const toGramFact = unit[0].ToGramFact;
        const factor = (quantity * toGramFact / 100);

        const newCalories = parseFloat((factor * food[0].Calories).toFixed(2));
        const newProtein = parseFloat((factor * food[0].Protein).toFixed(2));
        const newCarbs = parseFloat((factor * food[0].Carbs).toFixed(2));
        const newFat = parseFloat((factor * food[0].Fat).toFixed(2));

        // 4. حساب القيم القديمة (بما أننا لا نخزن الماكروز في mealfooditem، نحسبها من السعرات)
        const ratio = oldCalories / (food[0].Calories || 1);
        const oldProtein = ratio * food[0].Protein;
        const oldCarbs = ratio * food[0].Carbs;
        const oldFat = ratio * food[0].Fat;

        // 5. تحديث جدول الربط (mealfooditem)
        await db.query(
            'UPDATE mealfooditem SET Quantity = ?, UnitID = ?, TotalCalories = ? WHERE MealID = ? AND foodItemId = ?',
            [quantity, unitId, newCalories, mealId, foodItemId]
        );

        // 6. تحديث جدول الوجبة (meal) بإضافة "الفارق" فقط
        await db.query(
            `UPDATE meal SET 
                TotalCalories = TotalCalories - ? + ?, 
                TotalProtein = TotalProtein - ? + ?, 
                TotalCarbs = TotalCarbs - ? + ?, 
                TotalFat = TotalFat - ? + ? 
            WHERE MealID = ?`, 
            [oldCalories, newCalories, oldProtein, newProtein, oldCarbs, newCarbs, oldFat, newFat, mealId]
        );

        res.status(200).json({ message: 'تم التحديث بنجاح' });
    } catch (error) {
        res.status(500).json({ error: 'خطأ في التحديث' });
    }
};
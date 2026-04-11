const { db } = require('../config/db');

exports.createMeal = async (req, res) => {
  const { userId, mealType } = req.body; 
  try {
    const now = new Date();
    const mealTime = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0') + ':' + 
                    now.getSeconds().toString().padStart(2, '0');
    
    // إدخال الوجبة مع قيم صفرية (0) لضمان نجاح عملية الجمع لاحقاً
    const [result] = await db.query(
      `INSERT INTO Meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
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
  try {
    const [foodRows] = await db.query("SELECT Calories, Protein, Carbs, Fat FROM FoodItem WHERE FoodItemID = ?", [foodItemId]);
    const [unitRows] = await db.query(`SELECT ToGramFact FROM FoodItemServingUnit WHERE FoodItemID = ? AND UnitID = ?`, [foodItemId, unitId]);
    
    const toGram = unitRows[0].ToGramFact;
    const factor = (quantity * toGram / 100);
    
    // حساب القيم بدقة عالية قبل الإدخال
    const cal = parseFloat((factor * foodRows[0].Calories).toFixed(2));
    const pro = parseFloat((factor * (foodRows[0].Protein || 0)).toFixed(2));
    const carb = parseFloat((factor * (foodRows[0].Carbs || 0)).toFixed(2));
    const fat = parseFloat((factor * (foodRows[0].Fat || 0)).toFixed(2));

    // 1. إدخال الصنف
    await db.query(
      `INSERT INTO MealFoodItem (MealID, FoodItemID, Quantity, UnitID, TotalCalories) VALUES (?, ?, ?, ?, ?)`, 
      [mealId, foodItemId, quantity, unitId, cal]
    );

    // 2. تحديث الإجمالي في جدول Meal (الجمع المباشر من قاعدة البيانات)
    // داخل دالة addFoodToMeal، استبدلي استعلام التحديث بهذا:
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
    res.status(500).json({ error: "Database error" });
  }
};

exports.getMeal = async (req, res) => {
  const { mealId } = req.params;
  try {
    const [mealRows] = await db.query("SELECT * FROM Meal WHERE MealID = ?", [mealId]);
    if (!mealRows.length) return res.status(404).json({ error: "Meal not found" });

    const [items] = await db.query(`
      SELECT f.Name AS name, mfi.Quantity AS quantity, su.ShortCode AS unit, mfi.TotalCalories AS totalCalories, f.Protein AS protein, f.Carbs AS carbs, f.Fat AS fat
      FROM MealFoodItem mfi JOIN FoodItem f ON mfi.FoodItemID = f.FoodItemID JOIN ServingUnit su ON mfi.UnitID = su.UnitID
      WHERE mfi.MealID = ?`, [mealId]
    );
    res.json({ meal: mealRows[0], items: items });
  } catch (err) {
    console.error("Get Meal Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

exports.getTodayMeals = async (req, res) => {
  const { userId } = req.params;
  try {
    const [meals] = await db.query(
      `SELECT MealID, MealType, TotalCalories FROM Meal WHERE UserID = ? AND Date = CURDATE()`, 
      [userId]
    );

    const mealData = await Promise.all(meals.map(async meal => {
      const [items] = await db.query(`
        SELECT f.Name AS name, mfi.TotalCalories AS totalCalories, 
              f.Protein AS protein, f.Carbs AS carbs, f.Fat AS fat, 
              f.Fiber AS fiber, f.Sodium AS sodium, f.Cholesterol AS cholesterol
        FROM MealFoodItem mfi 
        JOIN FoodItem f ON mfi.FoodItemID = f.FoodItemID 
        WHERE mfi.MealID = ?`, [meal.MealID]
      );
      return { 
        mealId: meal.MealID, 
        mealType: meal.MealType, // هذا هو المفتاح لعدم الاختفاء
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
    const { userId } = req.params;

    try {
        // 1. جلب بيانات المستخدم والهدف اليومي للسعرات
        const [userRows] = await db.query(`
            SELECT u.*, ud.DailyCaloriesTarget, ud.DietTypeID 
            FROM user u 
            LEFT JOIN userdiettype ud ON u.UserID = ud.UserID 
            WHERE u.UserID = ? 
            ORDER BY ud.StartDate DESC LIMIT 1
        `, [userId]);

        if (userRows.length === 0) return res.status(404).json({ message: "User not found" });

        const userData = userRows[0];
        const targetCalories = userData.DailyCaloriesTarget || userData.DailyCalories || 2100;

        // 2. جلب مجموع السعرات لليوم الحالي فقط باستخدام CURDATE()
        const [consumedData] = await db.query(
            "SELECT SUM(TotalCalories) as total FROM meal WHERE UserID = ? AND Date = CURDATE()", 
            [userId]
        );
        
        const currentConsumed = parseFloat(consumedData[0].total || 0);
        const remaining = targetCalories - currentConsumed;

        let dynamicTips = [];

        // --- Tip 1: Encouragement ---
        dynamicTips.push({ 
            emoji: "🌟", 
            text: "Consistency is key! Every healthy choice you make today brings you closer to your goal." 
        });

        // --- Tip 2: Diet Specific Tip (كل الأنواع اللي تعبتي فيها موجودة هنا) ---
        const dietMessages = {
            2: "Focus on small, frequent meals with soft foods to soothe your digestion.",
            3: "Make sure to spread your protein intake across all your meals for better absorption.",
            4: "Increase your water intake today to help your body process the extra fiber.",
            5: "Choose lean protein sources like fish or skinless poultry for your next meal.",
            6: "Use lemon and spices instead of salt to flavor your food and manage blood pressure."
        };

        if (dietMessages[userData.DietTypeID]) {
            dynamicTips.push({ emoji: "🥗", text: dietMessages[userData.DietTypeID] });
        }

        // --- Tip 3: Dynamic Calories Logic ---
        if (currentConsumed === 0) {
            dynamicTips.push({ 
                emoji: "🍎", 
                text: `You have ${targetCalories} calories for today. Start by logging your first meal!` 
            });
        } else if (currentConsumed < targetCalories) {
            dynamicTips.push({ 
                emoji: "📊", 
                text: `You have consumed ${currentConsumed.toFixed(1)} calories. You still have ${Math.max(0, remaining).toFixed(0)} calories left.` 
            });
        } else {
            dynamicTips.push({ 
                emoji: "⚠️", 
                text: `You've reached your limit of ${targetCalories} calories. Focus on hydration now!` 
            });
        }

        res.json({
            healthTips: dynamicTips,
            summary: {
                total: targetCalories,
                consumed: currentConsumed,
                remaining: remaining > 0 ? remaining : 0
            }
        });

    } catch (error) {
        console.error("Home Data Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.addSuggestedMeal = async (req, res) => {
    const { userId, mealId, mealType, date } = req.body;
    const connection = await db.getConnection(); // لاستخدام الـ Transaction لضمان حفظ كل المكونات أو لا شيء

    try {
        await connection.beginTransaction();

        // 1. جلب بيانات الوجبة والمكونات من الكتالوج
        const [catalogRows] = await connection.query("SELECT * FROM MealsCatalog WHERE id = ?", [mealId]);
        if (catalogRows.length === 0) throw new Error("Meal not found");
        const mealData = catalogRows[0];

        // 2. إنشاء سجل وجبة جديد للمستخدم في جدول meal
        const [mealResult] = await connection.query(
            "INSERT INTO meal (UserID, MealType, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, mealType, date, mealData.calories, mealData.protein, mealData.carbs, mealData.fat]
        );
        const newUserMealId = mealResult.insertId;

        // 3. فك تشفير المكونات وإضافتها لجدول mealfooditem
        const ingredients = mealData.ingredientsJson; // مصفوفة الـ IDs مثلاً [5, 12, 8]
        if (ingredients && ingredients.length > 0) {
            for (const foodId of ingredients) {
                await connection.query(
                    "INSERT INTO mealfooditem (MealID, FoodItemID, Quantity) VALUES (?, ?, ?)",
                    [newUserMealId, foodId, 1] // نفترض الكمية 1 حالياً
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: "Suggested meal and its ingredients added successfully! 🎉" });

    } catch (err) {
        await connection.rollback();
        console.error("❌ Add Suggested Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// meal.controller.js
exports.getProgressData = async (req, res) => {
    const { userId } = req.params;
    try {
        const [userStats] = await db.query(`SELECT CurrentWeight, JoinDate FROM user WHERE UserID = ?`, [userId]);
        if (userStats.length === 0) return res.status(404).json({ error: "User not found" });

        // التعديل هنا: نستخدم CAST لضمان معاملة المجموع كرقم عشري دقيق
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

    
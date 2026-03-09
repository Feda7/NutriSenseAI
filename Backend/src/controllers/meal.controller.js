const { db } = require('../config/db');

exports.createMeal = async (req, res) => {
  const { userId, mealType } = req.body;
  try {
    const mealTime = mealType === 'breakfast' ? '08:00:00' : mealType === 'lunch' ? '13:00:00' : mealType === 'dinner' ? '19:00:00' : '16:00:00';
    const [result] = await db.query(`INSERT INTO Meal (UserID, MealTime, Date, TotalCalories) VALUES (?, ?, NOW(), 0)`, [userId, mealTime]);
    res.status(201).json({ message: "Meal created successfully", mealId: result.insertId });
  } catch (err) {
    console.error("Create Meal Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.addFoodToMeal = async (req, res) => {
  const { mealId, foodItemId, quantity, unitId } = req.body;
  try {
    const [foodRows] = await db.query("SELECT Calories FROM FoodItem WHERE FoodItemID = ?", [foodItemId]);
    if (!foodRows.length) return res.status(404).json({ error: "Food not found" });
    
    const caloriesPer100g = foodRows[0].Calories;
    const [unitRows] = await db.query(`SELECT ToGramFact FROM FoodItemServingUnit WHERE FoodItemID = ? AND UnitID = ?`, [foodItemId, unitId]);
    if (!unitRows.length) return res.status(400).json({ error: "Invalid unit for this food" });

    const toGram = unitRows[0].ToGramFact;
    const gramAmount = quantity * toGram;
    const totalCalories = (gramAmount / 100) * caloriesPer100g;

    const [existing] = await db.query(`SELECT * FROM MealFoodItem WHERE MealID = ? AND FoodItemID = ? AND UnitID = ?`, [mealId, foodItemId, unitId]);

    if (existing.length > 0) {
      await db.query(`UPDATE MealFoodItem SET Quantity = Quantity + ?, TotalCalories = TotalCalories + ? WHERE MealID = ? AND FoodItemID = ? AND UnitID = ?`, [quantity, totalCalories, mealId, foodItemId, unitId]);
    } else {
      await db.query(`INSERT INTO MealFoodItem (MealID, FoodItemID, Quantity, UnitID, TotalCalories) VALUES (?, ?, ?, ?, ?)`, [mealId, foodItemId, quantity, unitId, totalCalories]);
    }

    await db.query(`UPDATE Meal SET TotalCalories = TotalCalories + ? WHERE MealID = ?`, [totalCalories, mealId]);
    res.status(201).json({ message: "Food added successfully", addedCalories: totalCalories });
  } catch (err) {
    console.error("Add Food Error:", err);
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
    // 🔥 أضفنا MealType هنا عشان الفرونت أند يعرف يوزع الوجبات
    const [meals] = await db.query(
      `SELECT MealID, MealType, MealTime, TotalCalories FROM Meal WHERE UserID = ? AND Date = CURDATE()`, 
      [userId]
    );

    const mealData = await Promise.all(meals.map(async meal => {
      const [items] = await db.query(`
        SELECT f.Name AS name, mfi.Quantity AS quantity, su.ShortCode AS unit, 
              mfi.TotalCalories AS totalCalories, f.Protein AS protein, 
              f.Carbs AS carbs, f.Fat AS fat
        FROM MealFoodItem mfi 
        JOIN FoodItem f ON mfi.FoodItemID = f.FoodItemID 
        JOIN ServingUnit su ON mfi.UnitID = su.UnitID
        WHERE mfi.MealID = ?`, [meal.MealID]
      );
      // 🔥 نرجع الـ mealType للفرونت أند
      return { 
        mealId: meal.MealID, 
        mealType: meal.MealType, 
        mealTime: meal.MealTime, 
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
        
        // جلب الهدف اليومي المحسوب
        const targetCalories = userData.DailyCaloriesTarget || userData.DailyCalories || 2100;

        // 2. جلب مجموع السعرات من جدول الـ meal (استخدام الأسماء الصحيحة من صورتك)
        const today = new Date().toISOString().split('T')[0];
        
        const [consumedData] = await db.query(
            "SELECT SUM(TotalCalories) as total FROM meal WHERE UserID = ? AND DATE(Date) = ?", 
            [userId, today]
        );
        
        const currentConsumed = parseFloat(consumedData[0].total || 0);
        const remaining = targetCalories - currentConsumed;

        let dynamicTips = [];

        // --- Tip 1: Encouragement ---
        dynamicTips.push({ 
            emoji: "🌟", 
            text: "Consistency is key! Every healthy choice you make today brings you closer to your goal." 
        });

        // --- Tip 2: Diet Specific Tip ---
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

        // إرسال النتائج
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
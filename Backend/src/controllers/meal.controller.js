const { db } = require('../config/db');

exports.createMeal = async (req, res) => {
  const { userId, mealType } = req.body; 
  try {
    const now = new Date();
    const mealTime = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0') + ':' + 
                    now.getSeconds().toString().padStart(2, '0');
    
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
  const { mealId, id, quantity, unitId } = req.body;
  try {
    const [foodRows] = await db.query("SELECT Calories, Protein, Carbs, Fat FROM FoodItem WHERE id = ?", [id]);
    const [unitRows] = await db.query(`SELECT ToGramFact FROM FoodItemServingUnit WHERE id = ? AND UnitID = ?`, [id, unitId]);
    
    const toGram = unitRows[0].ToGramFact;
    const factor = (quantity * toGram / 100);
    
    const cal = parseFloat((factor * foodRows[0].Calories).toFixed(2));
    const pro = parseFloat((factor * (foodRows[0].Protein || 0)).toFixed(2));
    const carb = parseFloat((factor * (foodRows[0].Carbs || 0)).toFixed(2));
    const fat = parseFloat((factor * (foodRows[0].Fat || 0)).toFixed(2));

    await db.query(
      `INSERT INTO MealFoodItem (MealID, id, Quantity, UnitID, TotalCalories) VALUES (?, ?, ?, ?, ?)`, 
      [mealId, id, quantity, unitId, cal]
    );

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
      FROM MealFoodItem mfi JOIN FoodItem f ON mfi.id = f.id JOIN ServingUnit su ON mfi.UnitID = su.UnitID
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
        JOIN FoodItem f ON mfi.id = f.id 
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

// 🚀 تحديث دالة getHomeData لقراءة الأعمدة الحقيقية temp_ المتنوعة من قاعدة البيانات واختيارها ديناميكياً
exports.getHomeData = async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. جلب الهدف اليومي للسعرات من جدول user
        const [userRows] = await db.query(`
            SELECT DailyCalories 
            FROM user 
            WHERE UserID = ? 
            LIMIT 1
        `, [userId]);

        const targetCalories = userRows.length > 0 ? (userRows[0].DailyCalories || 2100) : 2100;

        // 2. جلب مجموع السعرات المستهلكة اليوم من جدول meal
        const [consumedData] = await db.query(
            "SELECT SUM(TotalCalories) as total FROM meal WHERE UserID = ? AND Date = CURDATE()", 
            [userId]
        );
        
        const currentConsumed = parseFloat(consumedData[0].total || 0);
        const remaining = targetCalories - currentConsumed;

// 3. جلب البيانات الحية الحقيقية مع تجميع آمن يمنع التكرار ويتوافق مع إعدادات MySQL الصارمة
const [rawMeals] = await db.query(
    `SELECT 
        MAX(id) AS id, 
        temp_name, 
        MAX(temp_calories) AS temp_calories, 
        MAX(temp_protein) AS temp_protein, 
        MAX(temp_carbs) AS temp_carb, 
        MAX(temp_fat) AS temp_fat, 
        MAX(temp_image) AS temp_image
     FROM food_dataset 
     GROUP BY temp_name
     ORDER BY RAND() 
     LIMIT 6`
);
        // 4. بناء النصائح الديناميكية
        let dynamicTips = [];
        dynamicTips.push({ 
            emoji: "🌟", 
            text: "Consistency is key! Every healthy choice you make today brings you closer to your goal." 
        });

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

        // 5. إرسال الكائن النظيف للفرونت إند لتظهر الوجبات والأسماء الحقيقية المدخلة مع صورها
        return res.status(200).json({
            healthTips: dynamicTips,
            suggestedMeals: rawMeals || [], 
            summary: {
                total: targetCalories,
                consumed: currentConsumed,
                remaining: remaining > 0 ? remaining : 0
            }
        });

    } catch (error) {
        console.error("Home Data Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// 🚀 تحديث دالة إضافة الوجبة المقترحة لتقرأ من مسميات temp_ الصحيحة لكي لا تفشل عملية الإدخال أو تخزن قيم صفرية
exports.addSuggestedMeal = async (req, res) => {
    const { userId, mealId, mealType, date } = req.body;
    const connection = await db.getConnection(); 

    try {
        await connection.beginTransaction();

        // 1. جلب بيانات الوجبة المقترحة بناءً على الـ id المرسل
        const [catalogRows] = await connection.query("SELECT * FROM `food_dataset` WHERE id = ?", [mealId]);
        
        // تأمين إضافي: إذا لم يجد الوجبة بالـ id الصغير، نجرب البحث بـ Id الكبير احتياطاً
        if (catalogRows.length === 0) {
            const [retryRows] = await connection.query("SELECT * FROM `food_dataset` WHERE Id = ?", [mealId]);
            if (retryRows.length === 0) throw new Error("Meal not found in food_dataset");
            catalogRows.push(retryRows[0]);
        }
        
        const mealData = catalogRows[0];

        // 2. القراءة الآمنة من الحقول الحقيقية لجدولك (تأخذ القيمة من temp_ أو القيمة العادية إن وجدت)
        const calories = mealData.temp_calories !== undefined ? mealData.temp_calories : (mealData.calories || 0);
        const protein  = mealData.temp_protein !== undefined ? mealData.temp_protein : (mealData.protein || 0);
        const carbs    = mealData.temp_carbs !== undefined ? mealData.temp_carbs : (mealData.carbs || mealData.temp_carb || 0);
        const fat      = mealData.temp_fat !== undefined ? mealData.temp_fat : (mealData.fat || 0);

        // 3. إدخال البيانات في جدول الوجبات الحية الخاص بالمستخدم (meal)
        await connection.query(
            `INSERT INTO meal (UserID, MealType, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, mealType, date, calories, protein, carbs, fat]
        );
        
        await connection.commit();
        res.status(201).json({ message: "Suggested meal added successfully! 🎉" });

    } catch (err) {
        await connection.rollback();
        console.error("❌ Add Suggested Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
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
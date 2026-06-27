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
// في ملف الباك إند:
exports.getTodayMeals = async (req, res) => {
  const { userId } = req.params;
  try {
    const todayDate = getTodayDateString(); 

    const [meals] = await db.query(
      `SELECT MealID, MealType, TotalCalories FROM meal WHERE UserID = ? AND Date = ?`, 
      [userId, todayDate]
    );

    const mealData = await Promise.all(meals.map(async meal => {

      // 🌟 تعديل ذهبي: أضفنا mfi.FoodItemID ليتم إرساله للفرونت إند لأجل عمليات الحذف والتعديل
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
    try {
        console.log("============= 🔴 Starting Secure Request Processing 🔴 =============");
        const { userId, mealType, modelLabel, quantity, unitChosen } = req.body;

        if (!userId || !mealType || !modelLabel) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const formattedLabel = modelLabel.toLowerCase().trim();
        
        // 1. جلب بيانات الأكلة والسعرات من الداتابيس
        const [foodRows] = await db.query(
            "SELECT * FROM fooditem WHERE LOWER(ModelLabel) = ? OR LOWER(Name) = ? LIMIT 1", 
            [formattedLabel, formattedLabel]
        );

        if (!foodRows || foodRows.length === 0) {
            return res.status(404).json({ error: `Food item '${modelLabel}' not found in database.` });
        }

        const foodItem = foodRows[0];
        const foodItemId = foodItem.FoodItemID;
        const baseCalories = parseFloat(foodItem.Calories) || 0;
        const protein = parseFloat(foodItem.Protein) || 0;
        const carbs = parseFloat(foodItem.Carbs) || 0;
        const fat = parseFloat(foodItem.Fat) || 0;

        // 2. معالجة الوحدات
        const currentQty = parseFloat(quantity) || 1;
        const currentUnit = unitChosen ? unitChosen.trim().toLowerCase() : 'piece';
        
        // تحديد معامل الضرب بناءً على الوحدة
        const unitsMap = { 'piece': 1.0, 'pc': 1.0, 'gram': 0.01, 'g': 0.01, 'slice': 1.0, 'cup': 2.0, 'bowl': 2.0, 'tablespoon': 0.15, 'teaspoon': 0.05 };
        const unitMultiplier = unitsMap[currentUnit] || 1.0;
        const unitId = currentUnit === 'gram' || currentUnit === 'g' ? 2 : (currentUnit === 'cup' || currentUnit === 'bowl' ? 4 : 1);

        const totalCalories = parseFloat((baseCalories * currentQty * unitMultiplier).toFixed(2));

        // 3. البحث عن وجبة اليوم أو إنشاؤها
        const [existingMeals] = await db.query(
            "SELECT MealID FROM meal WHERE UserID = ? AND LOWER(MealType) = ? AND Date = CURDATE() LIMIT 1",
            [userId, mealType.toLowerCase().trim()]
        );

        let mealId;
        if (existingMeals.length > 0) {
            mealId = existingMeals[0].MealID;
        } else {
            const [insertMeal] = await db.query(
                `INSERT INTO meal (UserID, MealType, MealTime, Date, TotalCalories, TotalProtein, TotalCarbs, TotalFat) 
                 VALUES (?, ?, CURTIME(), CURDATE(), 0, 0, 0, 0)`,
                [userId, mealType]
            );
            mealId = insertMeal.insertId;
        }

        // 4. الإدخال في جدول mealfooditem
        await db.query(
            `INSERT INTO mealfooditem (MealID, FoodItemID, Quantity, UnitID, TotalCalories) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                Quantity = Quantity + VALUES(Quantity),
                TotalCalories = TotalCalories + VALUES(TotalCalories)`,
            [mealId, foodItemId, currentQty, unitId, totalCalories]
        );

        // 5. تحديث الإجمالي في جدول الوجبة
        await db.query(
            `UPDATE meal SET TotalCalories = TotalCalories + ?, TotalProtein = TotalProtein + ?, TotalCarbs = TotalCarbs + ?, TotalFat = TotalFat + ? WHERE MealID = ?`,
            [totalCalories, (protein * currentQty * unitMultiplier), (carbs * currentQty * unitMultiplier), (fat * currentQty * unitMultiplier), mealId]
        );

        return res.status(201).json({ message: "Successfully added!", mealId, foodName: foodItem.Name });

    } catch (err) {
        console.error("❌ AI Meal Logging Error:", err);
        return res.status(500).json({ error: 'Database error occurred' });
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
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
    const [meals] = await db.query(`SELECT MealID, MealTime, TotalCalories FROM Meal WHERE UserID = ? AND Date = CURDATE()`, [userId]);
    const mealData = await Promise.all(meals.map(async meal => {
      const [items] = await db.query(`
        SELECT f.Name AS Name, mfi.Quantity, su.ShortCode, mfi.TotalCalories, f.Protein, f.Carbs, f.Fat
        FROM MealFoodItem mfi JOIN FoodItem f ON mfi.FoodItemID = f.FoodItemID JOIN ServingUnit su ON mfi.UnitID = su.UnitID
        WHERE mfi.MealID = ?`, [meal.MealID]
      );
      return { mealId: meal.MealID, mealTime: meal.MealTime, items };
    }));
    res.json(mealData);
  } catch (err) {
    console.error("Get Today's Meals Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

exports.getHomeData = async (req, res) => {
    try {
        const userId = req.params.userId;

        // 1. Get DietTypeID from the junction table userdiettype
        const [userDietRows] = await db.query(
            "SELECT DietTypeID FROM `userdiettype` WHERE UserID = ?", 
            [userId]
        );
        
        if (userDietRows.length === 0) {
            return res.status(200).json({ 
                suggestedMeals: [], 
                healthTips: [{ text: "Please complete your profile to get personalized meal suggestions! ✨", emoji: "📝" }] 
            });
        }
        
        const dietTypeId = userDietRows[0].DietTypeID;

        // 2. Get user diseases from userdiseases table
        const [diseaseRows] = await db.query(
            "SELECT DiseaseID FROM `userdiseases` WHERE UserID = ?",
            [userId]
        );
        const userDiseaseIds = diseaseRows.map(d => d.DiseaseID);

        // 3. Fetch suggested meals matching the DietType
        const [allSuggested] = await db.query(
            "SELECT * FROM MealsCatalog WHERE dietTypeId = ?", 
            [dietTypeId]
        );

        // 4. Filter meals to exclude unsuitable ones based on DiseaseIDs
        const filteredMeals = allSuggested.filter(meal => {
            if (!meal.unsuitableDiseases) return true;
            const unsuitableIds = meal.unsuitableDiseases.split(',').map(Number);
            return !userDiseaseIds.some(id => unsuitableIds.includes(id));
        });

        // 5. Personalized Health Tips in English
        let tips = [];
        
        // Example: If DiseaseID 1 is Diabetes
        if (userDiseaseIds.includes(1)) {
            tips.push({ text: "Since you're managing your blood sugar 🍬, try replacing white bread with whole grains to stay energized! ✨", emoji: "🌾" });
            tips.push({ text: "Drinking water 30 minutes before a meal can help regulate sugar levels. Give it a try today! 💧", emoji: "🥤" });
        }
        
        // Example: If DiseaseID 2 is Hypertension (Blood Pressure)
        if (userDiseaseIds.includes(2)) {
            tips.push({ text: "Keep your heart happy! Try reducing salt and use lemon or herbs to add great flavor to your meals 🍋", emoji: "🌿" });
        }
        
        // Default tips if no specific diseases are found
        if (tips.length === 0) {
            tips.push({ text: "You're doing a great job! Keep staying hydrated and stick to your plan to reach your goals 💪", emoji: "🌟" });
            tips.push({ text: "Remember, a good night's sleep is essential for weight loss and overall health 😴", emoji: "🌙" });
        }

        res.json({ suggestedMeals: filteredMeals, healthTips: tips });

    } catch (err) {
        console.error("❌ Home Data Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
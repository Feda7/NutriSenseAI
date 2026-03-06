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
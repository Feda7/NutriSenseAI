const { db } = require('../config/db');

exports.getAllFood = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT FoodItemID, Name, Calories, Protein, Carbs, Fat FROM FoodItem`);
    res.json(rows);
  } catch (err) {
    console.error("Get Food Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

exports.searchFood = async (req, res) => {
  const { q } = req.query;
  try {
    if (!q) return res.json([]);
    const [rows] = await db.query(`SELECT FoodItemID, Name, Calories, Protein, Carbs, Fat FROM FoodItem WHERE Name LIKE ?`, [`${q}%`]);
    res.json(rows);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const [units] = await db.query(`SELECT UnitID AS unitId, UnitName AS name, ShortCode AS shortCode FROM ServingUnit`);
    res.json(units);
  } catch (err) {
    console.error("Get Units Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

exports.getFoodUnits = async (req, res) => {
  const { foodId } = req.params;
  try {
    const [units] = await db.query(`
      SELECT su.UnitID AS unitId, su.UnitName AS name, su.ShortCode AS shortCode, fsu.ToGramFact AS toGram
      FROM FoodItemServingUnit fsu JOIN ServingUnit su ON fsu.UnitID = su.UnitID
      WHERE fsu.FoodItemID = ?`, [foodId]
    );
    res.json(units);
  } catch (err) {
    console.error("Get Food Units Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};
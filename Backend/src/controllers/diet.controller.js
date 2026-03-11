const { db } = require("../config/db");

// جلب جميع الدايت
exports.getDiets = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM diettype");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch diets" });
  }
};

// إضافة دايت
exports.addDiet = async (req, res) => {
  const { name } = req.body;

  try {
    await db.query(
      "INSERT INTO diettype (Name) VALUES (?)",
      [name]
    );

    res.json({ message: "Diet added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add diet" });
  }
};

// حذف دايت
exports.deleteDiet = async (req, res) => {
  const id = req.params.id;

  try {
    await db.query(
      "DELETE FROM diettype WHERE DietTypeID = ?",
      [id]
    );

    res.json({ message: "Diet deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};
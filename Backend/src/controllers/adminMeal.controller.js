const { db } = require("../config/db")

// جلب كل الوجبات للداشبورد
exports.getMeals = async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT 
      MealID,
      Name,
      Calories,
      Protein,
      Carbs,
      Fat,
      ImagePath
      FROM meal
    `)

    res.json(rows)

  } catch (error) {

    console.error(error)
    res.status(500).json({ error: "Failed to fetch meals" })

  }

}


// حذف وجبة
exports.deleteMeal = async (req, res) => {

  const id = req.params.id

  try {

    await db.query(
      "DELETE FROM meal WHERE MealID = ?",
      [id]
    )

    res.json({ message: "Meal deleted" })

  } catch (error) {

    res.status(500).json({ error: "Delete failed" })

  }

}
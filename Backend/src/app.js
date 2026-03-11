const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const mealRoutes = require("./routes/meal.routes");
const foodRoutes = require("./routes/food.routes");
const dietRoutes = require("./routes/diet.routes");
const adminMealRoutes = require("./routes/adminMeal.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("NutriSense API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/diets", dietRoutes);
app.use("/api/admin/meals", adminMealRoutes)


module.exports = app;

app.use("/api/users", userRoutes);
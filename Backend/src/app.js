const express = require("express");
const cors = require("cors");

const { db, findUserByCredentials } = require('./config/db');

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const mealRoutes = require("./routes/meal.routes");
const foodRoutes = require("./routes/food.routes");

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

module.exports = app;

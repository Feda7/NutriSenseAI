const express = require("express");
const cors = require("cors");

const { db, findUserByCredentials } = require('../config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("NutriSense API is running");
});

module.exports = app;

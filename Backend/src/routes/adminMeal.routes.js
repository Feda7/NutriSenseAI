const express = require("express")
const router = express.Router()

const controller = require("../controllers/adminMeal.controller")

router.get("/", controller.getMeals)
router.delete("/:id", controller.deleteMeal)

module.exports = router
const express = require("express")
const router = express.Router()

const controller = require("../controllers/adminMeal.controller")

// 1. مسار جلب إحصائيات لوحة التحكم الأساسية (الجديد)
router.get("/dashboard", controller.getAdminDashboardStats)

// 2. جلب كل الوجبات للداشبورد (القديم)
router.get("/", controller.getMeals)

// 3. حذف وجبة (القديم)
router.delete("/:id", controller.deleteMeal)

module.exports = router
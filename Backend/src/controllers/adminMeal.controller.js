const { db } = require("../config/db"); // استدعاء قاعدة البيانات الموحد للباكيند

// 1. جلب إحصائيات لوحة التحكم بالكامل (الجديدة)
exports.getAdminDashboardStats = async (req, res) => {
    try {
        // حساب إجمالي المستخدمين في جدول user
        const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) as totalUsers FROM user");
        
        // حساب إجمالي الوجبات الفريدة في جدول food_dataset
        const [[{ totalMeals }]] = await db.query("SELECT COUNT(DISTINCT temp_name) as totalMeals FROM food_dataset");

        // جلب آخر 5 مستخدمين تم تسجيلهم
        const [recentUsers] = await db.query(
            "SELECT firstName, lastName, email, DATE_FORMAT(created_at, '%Y-%m-%d') as joinedAt, diet, medical FROM user ORDER BY id DESC LIMIT 5"
        );

        // جلب الوجبات الأعلى في قاعدة البيانات (أو محاكاة تكرارها بناءً على المتاح)
        const [topMeals] = await db.query(
            "SELECT temp_name as name, 12 as count FROM food_dataset LIMIT 5"
        );

        // توزيع الحالات الصحية ديناميكياً بناءً على حقل medical المخزن في جدول المستخدمين
        const [usersList] = await db.query("SELECT medical FROM user");
        const conditions = { Hypertension: 0, Diabetes: 0, Colon: 0, Cholesterol: 0, None: 0 };
        
        usersList.forEach(u => {
            let medicalArray = [];
            try {
                medicalArray = typeof u.medical === 'string' ? JSON.parse(u.medical) : (u.medical || []);
            } catch (e) {
                if (u.medical) medicalArray = [u.medical];
            }
            
            if (Array.isArray(medicalArray)) {
                medicalArray.forEach(cond => {
                    if (conditions[cond] !== undefined) conditions[cond]++;
                });
            } else if (typeof medicalArray === 'string' && conditions[medicalArray] !== undefined) {
                conditions[medicalArray]++;
            }
        });

        // إرسال كائن البيانات المتكامل للواجهة
        return res.status(200).json({
            stats: {
                totalUsers: totalUsers || 0,
                activeUsers: totalUsers || 0, 
                totalMeals: totalMeals || 0,
                avgCalories: 2200
            },
            users: recentUsers,
            meals: topMeals,
            conditions: conditions
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// 2. جلب كل الوجبات للداشبورد (مدمجة ومعدلة لتطابق حقل الصورة لديكِ)
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
        `);
        return res.json(rows);
    } catch (error) {
        console.error("Failed to fetch meals:", error);
        return res.status(500).json({ error: "Failed to fetch meals" });
    }
};

// 3. حذف وجبة (الدالة القديمة حافظنا عليها من الحذف لضمان عمل أزرار الحذف)
exports.deleteMeal = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query(
            "DELETE FROM meal WHERE MealID = ?",
            [id]
        );
        return res.json({ message: "Meal deleted" });
    } catch (error) {
        console.error("Delete failed:", error);
        return res.status(500).json({ error: "Delete failed" });
    }
};
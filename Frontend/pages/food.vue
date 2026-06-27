<template>
    <section class="max-full bg-gray-50 lg:px-80 md:px-56" >
    <div class="min-h-screen px-6 py-10">
    
    <SummarySection
    :userCalories="userCalories"
    :consumed="consumed"
    :remaining="remaining"
    />

    <div class="my-10"></div>

    <MealsSection
    :meals="meals"
    :mealIds="mealIds" 
    :dietType="dietType"
    :diseases="diseases"
    @addFood="addFoodToMeal"
    @uploadImage="analyzeImageForMeal"
    @refreshMeals="fetchMeals" 
    />

    </div>
    </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useState } from '#app'
import SummarySection from '../components/SummarySection.vue'
import MealsSection from '../components/MealsSection.vue'

const currentUser = useState('currentUser')

// مفاتيح الحالة
const userCalories = ref(0)
const consumed = ref(0)
const remaining = ref(0)
const diseases = ref([])
const meals = ref({ breakfast: [], lunch: [], dinner: [], snacks: [] })

// تم التأكيد على البنية النظيفة الافتراضية
const mealIds = ref({ breakfast: null, lunch: null, dinner: null, snacks: null })

const dietType = computed(() => {
    if (process.client) {
        return currentUser.value?.dietTypeId || localStorage.getItem('dietTypeId') || null
    }
    return null
})

function getUserId() {
    if (process.client) {
        return currentUser.value?.id || JSON.parse(localStorage.getItem('user'))?.id
    }
    return null
}

// 🔄 دالة جلب البيانات المصلّحة والمسؤولة عن زرع الـ IDs بالكامل للفرونت إند
async function fetchMeals() {
    const userId = getUserId();
    if (!userId) return;

    try {
        const mealRes = await fetch(`http://localhost:5000/api/meal/today/${userId}`);
        if (mealRes.ok) {
            const data = await mealRes.json();
            
            // 🌟 تعديل آمن: تفريغ المعرفات القديمة لكي لا تعلق الوجبة المحذوفة في الذاكرة
            mealIds.value = { breakfast: null, lunch: null, dinner: null, snacks: null };
            const newMeals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            
            data.forEach(meal => {
                const type = meal.mealType?.toLowerCase() || meal.MealType?.toLowerCase();
                const currentMealId = meal.mealId || meal.MealID || meal.id;

                if (newMeals[type] !== undefined && currentMealId) {
                    // 1. حفظ معرّف الوجبة في المتغير المخصص له ليقرأه الكرت
                    mealIds.value[type] = currentMealId;
                    
                    // 2. زرع معرّفات الـ ID داخل عناصر الوجبة لضمان وصولها لأزرار الحذف والتعديل
                    newMeals[type] = (meal.items || meal.Items || []).map(item => ({
                        ...item,
                        mealId: currentMealId,
                        foodItemId: item.foodItemId || item.FoodItemID || item.id || item.FoodId
                    }));
                }
            });
            
            meals.value = newMeals;
            recalcSummary();
            console.log("🔄 Fixed Meals & IDs injected successfully:", meals.value);
        }
    } catch (err) {
        console.error("Error refreshing meals:", err);
    }
}

// دالة التحميل عند فتح الصفحة
onMounted(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
        // 1. جلب هدف السعرات للمستخدم والمعلومات الطبية (الأمراض) إن وجدت
        const userRes = await fetch(`http://localhost:5000/api/user/${userId}`);
        if (userRes.ok) {
            const userData = await userRes.json();
            userCalories.value = userData.DailyCaloriesTarget || userData.DailyCalories || 2100;
            
            // إذا كان الباك إند يعيد الأمراض، نقوم بتعبئتها هنا لتفعيل التحذيرات
            if (userData.diseases) {
                diseases.value = userData.diseases;
            }
        }

        // 2. استدعاء دالة الجلب الموحدة لزرع البيانات والـ IDs فوراً
        await fetchMeals();

    } catch (err) {
        console.error("Initialization error:", err);
    }
});

function recalcSummary() {
    let total = 0;
    Object.values(meals.value).forEach(mealArray => {
        mealArray.forEach(item => {
            total += Number(item.totalCalories || item.Calories || 0);
        });
    });
    consumed.value = total;
    remaining.value = userCalories.value - total;
}

async function addFoodToMeal(mealName, foodItem) {
    try {
        const userId = getUserId();
        let mealId = mealIds.value[mealName.toLowerCase()];

        // إنشاء الوجبة إذا لم تكن موجودة
        if (!mealId) {
            const mealRes = await fetch('http://localhost:5000/api/meal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, mealType: mealName })
            });
            const mealData = await mealRes.json();
            mealId = mealData.mealId;
            mealIds.value[mealName.toLowerCase()] = mealId;
        }

        // إضافة الصنف
        await fetch('http://localhost:5000/api/meal/item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mealId,
                foodItemId: foodItem.foodItemId,
                quantity: foodItem.quantity || 1,
                unitId: foodItem.unitId || 1
            })
        });

        // تحديث البيانات بالكامل عبر الدالة الموحدة لضمان ثبات المزامنة والـ IDs
        await fetchMeals();

    } catch (err) {
        console.error("Add food error:", err);
    }
}

async function analyzeImageForMeal(mealName, imageFile) {
    try {
        const userId = getUserId();
        if (!userId) return;

        // 1. إرسال الصورة لسيرفر الذكاء الاصطناعي
        const formData = new FormData();
        formData.append('image', imageFile); 

        const aiResponse = await fetch('http://localhost:5050/predict', {
            method: 'POST',
            body: formData 
        });

        if (!aiResponse.ok) throw new Error('AI analysis failed');

        const aiResult = await aiResponse.json();
        const foodLabel = aiResult.class_name ? aiResult.class_name.replace(/_/g, ' ') : 'Food Item';
        console.log("AI Recognized Text Label: 🥳", aiResult.class_name); 

        // 2. طلب المدخلات من المستخدم (يمكنه الآن كتابة 0.5 أو 0.25)
        const userInputQty = prompt(`AI detected: "${foodLabel}"\nEnter QUANTITY (e.g., 1, 0.5, 0.25):`, "1");
        if (userInputQty === null) return; 

        const userInputUnit = prompt(`Choose UNIT:\n-> Piece\n-> Gram\n-> Slice\n-> Cup\n-> Tablespoon\n-> Teaspoon`, "Piece");
        if (userInputUnit === null) return;

        // التحويل لعدد عشري مع دعم الحماية البرمجية من القيم الخاطئة
        let finalQuantity = parseFloat(userInputQty);
        if (isNaN(finalQuantity) || finalQuantity <= 0) {
            finalQuantity = 1; // القيمة الافتراضية في حال الإدخال الخاطئ
        }

        // 3. إرسال النص مباشرة إلى مسار الـ API الأصلي في الباك إند
        const backendResponse = await fetch('http://localhost:5000/api/meal/add-meal-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                mealType: mealName,
                modelLabel: aiResult.class_name, 
                quantity: finalQuantity, // سيُرسل الآن كـ 0.5 أو 0.25 بنجاح
                unitChosen: userInputUnit.trim().toLowerCase()
            })
        });

        if (!backendResponse.ok) {
            const errData = await backendResponse.json();
            throw new Error(errData.error || 'Backend original flow failed');
        }

        const finalResult = await backendResponse.json();

        // 4. تحديث الواجهة فوراً بناءً على المسار الأصلي
        await fetchMeals();
        alert(finalResult.message || `Successfully logged your meal!`);

    } catch (err) {
        console.error("AI original flow error:", err);
        alert(err.message || "Failed to process image through original path.");
    }
}
</script>
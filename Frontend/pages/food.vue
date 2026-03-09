<template>
    <section class="max-full bg-gray-50 lg:px-80 md:px-56" >
    <div class="min-h-screen  px-6 py-10">
    
    <!-- Daily Summary Section -->
    <SummarySection
    :userCalories="userCalories"
    :consumed="consumed"
    :remaining="remaining"
    />

    <div class="my-10"></div>

    <!-- Meals Section -->
    <MealsSection
      :meals="meals"
      :dietType="dietType"
      :diseases="diseases"
      @addFood="addFoodToMeal"
      @uploadImage="analyzeImageForMeal"
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
const mealIds = ref({ breakfast: null, lunch: null, dinner: null, snacks: null })

const dietType = computed(() => {
    return currentUser.value?.dietTypeId || localStorage.getItem('dietTypeId') || null
})

function getUserId() {
    return currentUser.value?.id || JSON.parse(localStorage.getItem('user'))?.id
}

// دالة واحدة فقط عند التحميل لضمان عدم التضارب
onMounted(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
        // 1. جلب هدف السعرات
        const userRes = await fetch(`http://localhost:5000/api/user/${userId}`);
        if (userRes.ok) {
            const userData = await userRes.json();
            userCalories.value = userData.DailyCaloriesTarget || userData.DailyCalories || 2100;
        }

        // 2. جلب وجبات اليوم وتوزيعها
        const mealRes = await fetch(`http://localhost:5000/api/meal/today/${userId}`);
        if (mealRes.ok) {
            const data = await mealRes.json();
            
            // تصفية المصفوفات
            const newMeals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            
            data.forEach(meal => {
                const type = meal.mealType?.toLowerCase();
                if (newMeals[type] !== undefined) {
                    mealIds.value[type] = meal.mealId;
                    newMeals[type] = meal.items || [];
                }
            });
            meals.value = newMeals;
            recalcSummary();
        }
    } catch (err) {
        console.error("Initialization error:", err);
    }
});

function recalcSummary() {
    let total = 0;
    Object.values(meals.value).forEach(mealArray => {
        mealArray.forEach(item => {
            total += Number(item.totalCalories || 0);
        });
    });
    consumed.value = total;
    remaining.value = userCalories.value - total;
}

async function addFoodToMeal(mealName, foodItem) {
    try {
        const userId = getUserId();
        let mealId = mealIds.value[mealName];

        // إنشاء الوجبة إذا لم تكن موجودة
        if (!mealId) {
            const mealRes = await fetch('http://localhost:5000/api/meal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, mealType: mealName })
            });
            const mealData = await mealRes.json();
            mealId = mealData.mealId;
            mealIds.value[mealName] = mealId;
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

        // تحديث البيانات من السيرفر فوراً لضمان المزامنة
        const updatedRes = await fetch(`http://localhost:5000/api/meal/${mealId}`);
        const updatedData = await updatedRes.json();
        
        // تحديث المصفوفة الخاصة بهذه الوجبة فقط
        meals.value[mealName] = updatedData.items || [];
        recalcSummary();

    } catch (err) {
        console.error("Add food error:", err);
    }
}

async function analyzeImageForMeal(mealName, imageFile) {
    const aiResult = { foodItemId: 1, quantity: 1, unitId: 1 }; // تجريبي
    await addFoodToMeal(mealName, aiResult);
}
</script>

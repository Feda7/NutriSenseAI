<template>
    <section class="max-full bg-gray-50 md:px-56">
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
    @addFood="addFoodToMeal"
    @uploadImage="analyzeImageForMeal"
    />

    </div>
    </section>
</template>

<script setup>

import { ref } from 'vue';

/* USER DAILY CALORIES */
const userCalories = ref(1900)
const consumed = ref(650)
const remaining = ref(userCalories.value - consumed.value)
const foodData = useState("foodData");


/* MEALS DATA */
const meals = ref({
breakfast: [],
lunch: [],
dinner: [],
snacks: [],
})

const currentUser = useState('currentUser') 
const userId = currentUser.value?.id || 1

// ==============================
// ✅ Add Meal
// ==============================
async function addFoodToMeal(mealName, foodItem) {
  try {
    console.log('🧪 foodItem:', foodItem)
    console.log('🧪 userId:', userId)

    // 1️⃣ تحديث الواجهة مباشرة
    meals.value[mealName].push(foodItem)
    consumed.value += foodItem.calories
    remaining.value = userCalories.value - consumed.value

    // 2️⃣ إنشاء Meal في الباك إند
    const mealRes = await fetch('http://localhost:5000/api/meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        mealType: mealName,
        totalCalories: foodItem.calories,
        details: foodItem.name
      })
    })

    const mealData = await mealRes.json()
    console.log('Meal response:', mealData)

    if (!mealData.mealId) {
      throw new Error('Meal not created in DB')
    }

    // 3️⃣ إضافة الصنف داخل Contains
    const containsRes = await fetch('http://localhost:5000/api/meal/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealId: mealData.mealId,
        foodItemId: 1,     // مؤقت للتجربة
        quantity: 1,
        totalCalories: foodItem.calories,
        name: foodItem.name
      })
    })

    const containsData = await containsRes.json()
    console.log('Contains response:', containsData)

  } catch (err) {
    console.error('❌ Error adding food to meal:', err)
  }
}

// ==============================
// ✅ Add Meal + AI
// ==============================
async function analyzeImageForMeal(mealName, imageFile) {
  // مثال نتيجة AI مؤقتة
  const aiResult = {
    id: 1,             // لاحقاً تحصلين ID الحقيقي من جدول FoodItem
    name: 'Chicken Salad',
    calories: 350,
    protein: 22,
    carbs: 18,
    fat: 12
  }

  await addFoodToMeal(mealName, aiResult)
}
</script>

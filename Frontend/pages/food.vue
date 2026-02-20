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

/* ADD FOOD MANUALLY */
async function addFoodToMeal(mealName, foodItem) {
  meals.value[mealName].push(foodItem)
  consumed.value += foodItem.calories
  remaining.value = userCalories.value - consumed.value

  // 1️⃣ إنشاء الوجبة
  const mealRes = await fetch('http://localhost:5000/api/meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 1,                 // لاحقاً من اليوزر الحقيقي
      mealType: mealName,        // breakfast / lunch / dinner / snacks
      totalCalories: foodItem.calories,
      details: foodItem.name
    })
  });

  const mealData = await mealRes.json();
  const mealId = mealData.mealId;

  // 2️⃣ إضافة الصنف داخل الوجبة
  await fetch('http://localhost:5000/api/meal/item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mealId: mealId,
      foodItemId: 1,            // مؤقتاً (لما نربط FoodItem فعلياً)
      quantity: 1,
      totalCalories: foodItem.calories,
      name: foodItem.name
    })
  });
}


/* ADD VIA IMAGE + AI */
async function analyzeImageForMeal(mealName, imageFile) {
  const aiResult = {
    name: 'Chicken Salad',
    calories: 350,
    protein: 22,
    carbs: 18,
    fat: 12
  }

  meals.value[mealName].push(aiResult)
  consumed.value += aiResult.calories
  remaining.value = userCalories.value - consumed.value

  // 1️⃣ إنشاء الوجبة
  const mealRes = await fetch('http://localhost:5000/api/meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 1,
      mealType: mealName,
      totalCalories: aiResult.calories,
      details: aiResult.name
    })
  });

  const mealData = await mealRes.json();
  const mealId = mealData.mealId;

  // 2️⃣ إضافة الصنف داخل الوجبة
  await fetch('http://localhost:5000/api/meal/item', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mealId: mealId,
      foodItemId: 1,
      quantity: 1,
      totalCalories: aiResult.calories,
      name: aiResult.name
    })
  });
}
</script>

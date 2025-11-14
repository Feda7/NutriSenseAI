<template>
    <section class="max-full bg-gray-50 px-56">
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

/* USER DAILY CALORIES */
const userCalories = ref(1900)
const consumed = ref(650)
const remaining = ref(userCalories.value - consumed.value)

/* MEALS DATA */
const meals = ref({
breakfast: [],
lunch: [],
dinner: [],
snacks: [],
})

/* ADD FOOD MANUALLY */
function addFoodToMeal(mealName, foodItem) {
meals.value[mealName].push(foodItem)
consumed.value += foodItem.calories
remaining.value = userCalories.value - consumed.value
}

/* ADD VIA IMAGE + AI */
function analyzeImageForMeal(mealName, imageFile) {
  // هنا بعدين تربطون API الذكاء الاصطناعي
  // الآن نحط بيانات تجريبية
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
}
</script>

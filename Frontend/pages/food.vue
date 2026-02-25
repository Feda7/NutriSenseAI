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
    :diseases="diseases"
    @addFood="addFoodToMeal"
    @uploadImage="analyzeImageForMeal"
    />

    </div>
    </section>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useState } from '#app'

const currentUser = useState('currentUser')
const diseases = ref([])

/* USER DAILY CALORIES */
const userCalories = ref(0)
const consumed = ref(0)
const remaining = ref(0)

function recalcSummary() {
  let total = 0

  Object.values(meals.value).forEach(mealArray => {
    mealArray.forEach(item => {
      total += Number(item.totalCalories || 0)
    })
  })

  consumed.value = total
  remaining.value = userCalories.value - total
}
/* نخليهم arrays مو null عشان ما ينهار الرندر */
const meals = ref({
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
})

/* نخزن mealIds عشان ما ننشئ كل مرة meal جديد */
const mealIds = ref({
  breakfast: null,
  lunch: null,
  dinner: null,
  snacks: null,
})

function getUserId() {
  return currentUser.value?.id
}

/* ==============================
    ✅ عند فتح الصفحة نجيب وجبات اليوم
   ============================== */
onMounted(async () => {

  const userId = getUserId()
  if (!userId) return

  try {
    const res = await fetch(`http://localhost:5000/api/meal/today/${userId}`)

    if (!res.ok) return

    const data = await res.json()

    data.forEach(meal => {
      mealIds.value[meal.mealType] = meal.mealId
      meals.value[meal.mealType] = meal.items || []
      recalcSummary()
    })

  } catch (err) {
    console.error("Load meals error:", err)
  }

})


// ==============================
// ✅ Add Food To Meal (نسخة بروفيشنل)
// ==============================
async function addFoodToMeal(mealName, foodItem) {
  try {

    const userId = getUserId()
    if (!userId) {
      console.error("User not logged in")
      return
    }

    if (!foodItem.foodItemId) {
      console.error("FoodItemID missing ❌")
      return
    }

    let mealId = mealIds.value[mealName]

    // 🔥 إذا ما فيه meal مسبقاً ننشئه مرة واحدة فقط
    if (!mealId) {

      const mealRes = await fetch('http://localhost:5000/api/meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          mealType: mealName
        })
      })

      if (!mealRes.ok) throw new Error("Meal creation failed")

      const mealData = await mealRes.json()

      if (!mealData.mealId) {
        throw new Error("Meal ID not returned")
      }

      mealId = mealData.mealId
      mealIds.value[mealName] = mealId
    }

    // 🔥 نضيف العنصر فقط
    const foodRes = await fetch('http://localhost:5000/api/meal/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mealId: mealId,
        foodItemId: foodItem.foodItemId,
        quantity: foodItem.quantity || 1,
        unitId: foodItem.unitId || 1
      })
    })

    if (!foodRes.ok) throw new Error("Add food failed")

    const foodResponse = await foodRes.json()

    // 🔥 نجيب الوجبة بعد التحديث
    const updatedMeal = await fetch(
      `http://localhost:5000/api/meal/${mealId}`
    )

    if (!updatedMeal.ok) throw new Error("Fetch meal failed")

    const updatedData = await updatedMeal.json()

    meals.value[mealName] = updatedData.items || []

    // تحديث السعرات
    recalcSummary()

  } catch (err) {
    console.error("Error:", err)
  }
}


// ==============================
// ✅ Add Meal + AI
// ==============================
async function analyzeImageForMeal(mealName, imageFile) {

  // ⚠️ هذا مثال مؤقت — لازم لاحقاً يرجع ID حقيقي من السيرفر
  const aiResult = {
    foodItemId: 1,
    quantity: 1,
    unitId: 1
  }

  await addFoodToMeal(mealName, aiResult)
}

</script>

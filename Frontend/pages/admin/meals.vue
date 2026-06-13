<template>
  <div class="min-h-screen bg-gray-100 flex">
    
    <main class="flex-1 p-8">

      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Meals Library</h2>
        <p class="text-sm text-gray-500">Manage and audit the food recipes and macro distributions</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div
          v-for="meal in meals"
          :key="meal.MealID"
          class="bg-white rounded-2xl shadow-sm p-5 flex gap-4 border border-gray-100 hover:shadow-md transition duration-200"
        >

          <div class="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
            <img
              v-if="meal.ImagePath"
              :src="meal.ImagePath"
              class="w-full h-full object-cover"
              alt="meal image"
            />
            <div
              v-else
              class="text-gray-400 text-xs flex flex-col items-center justify-center h-full gap-1"
            >
              <span class="text-lg">🍲</span>
              <span>No Image</span>
            </div>
          </div>

          <div class="flex flex-col justify-between flex-1">
            <div>
              <h3 class="font-bold text-gray-800 text-base line-clamp-1">
                {{ meal.Name }}
              </h3>

              <div class="mt-1">
                <span class="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
                  {{ meal.Calories }} kcal
                </span>
              </div>

              <div class="flex gap-2 mt-3 text-xs">
                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">P: {{ meal.Protein }}g</span>
                <span class="px-2 py-0.5 bg-amber-50 text-amber-600 rounded font-medium">C: {{ meal.Carbs }}g</span>
                <span class="px-2 py-0.5 bg-red-50 text-red-600 rounded font-medium">F: {{ meal.Fat }}g</span>
              </div>
            </div>

            <div class="flex justify-end mt-2">
              <button
                @click="deleteMeal(meal.MealID)"
                class="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition duration-150"
              >
                Delete Meal
              </button>
            </div>

          </div>

        </div>

      </div>

      <div v-if="meals.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto mt-12">
        <div class="text-4xl mb-3">🥗</div>
        <h3 class="text-lg font-semibold text-gray-700">No Meals Available</h3>
        <p class="text-sm text-gray-400 mt-1">The meals table in the database is currently empty.</p>
      </div>

    </main>

  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin"
})

import { ref, onMounted } from "vue"

const meals = ref([])

// تم ضبط الرابط تماماً ليتوافق مع هيكلة الـ app.js لديكِ ومخرجات الباكيند المحدثة
const API = "http://localhost:5000/api/admin/meals"

/* =======================
   جلب الوجبات
======================= */
async function fetchMeals(){
  try{
    const res = await fetch(API)
    const data = await res.json()
    meals.value = data || []
  }
  catch(error){
    console.error("Failed to load meals", error)
  }
}

onMounted(()=>{
  fetchMeals()
})

/* =======================
   حذف وجبة
======================= */
async function deleteMeal(id){
  if(confirm("Are you sure you want to delete this meal?")) {
    try{
      await fetch(`${API}/${id}`,{
        method:"DELETE"
      })

      meals.value = meals.value.filter(
        m => m.MealID !== id
      )
    }
    catch(error){
      console.error("Delete failed", error)
    }
  }
}
</script>
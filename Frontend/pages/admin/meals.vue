
<template>
  <div class="min-h-screen bg-gray-100 flex">
    
    <!-- Main Panel -->
    <main class="flex-1 p-8">

      <h2 class="text-2xl font-bold mb-6">Meals Library</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div
          v-for="meal in meals"
          :key="meal.MealID"
          class="bg-white rounded-xl shadow p-4 flex gap-4"
        >

          <!-- Meal Image -->
          <div class="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">

            <img
              v-if="meal.ImagePath"
              :src="meal.ImagePath"
              class="w-full h-full object-cover"
            />

            <span
              v-else
              class="text-gray-400 text-sm flex items-center justify-center h-full"
            >
              No Image
            </span>

          </div>

          <!-- Meal Info -->
          <div class="flex-1">

            <h3 class="font-semibold text-lg">
              {{ meal.Name }}
            </h3>

            <p class="text-sm text-gray-600">
              Calories: {{ meal.Calories }} kcal
            </p>

            <p class="text-sm text-gray-600">
              P: {{ meal.Protein }}g,
              C: {{ meal.Carbs }}g,
              F: {{ meal.Fat }}g
            </p>

            <!-- Actions -->
            <div class="flex gap-3 mt-2">

              <button
                @click="deleteMeal(meal.MealID)"
                class="text-red-500 text-xs hover:underline"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

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

const API = "http://localhost:5000/api/admin/meals"



/* =======================
   جلب الوجبات
======================= */

async function fetchMeals(){

  try{

    const res = await fetch(API)

    const data = await res.json()

    meals.value = data

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

</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Suggested Meals Section -->
    <section class="px-20">
      <h2 class="text-2xl font-bold text-green-700 mb-6 pt-10">Suggested Meals</h2>
      <p class="text-lg text-green-700 mb-10">Here are today’s suggested meals tailored for a healthier life.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        <div 
          v-for="meal in meals"
          :key="meal.name"
          class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition px-7"
        >
          <img :src="meal.image" class="w-full h-56 object-cover rounded-2xl" />

          <div class="p-5 space-y-2">
            <h3 class="text-xl font-semibold text-gray-800">{{ meal.name }}</h3>

            <p class="text-gray-600 text-sm">
              {{ meal.calories }} cal • Protein {{ meal.protein }}g • Carbs {{ meal.carbs }}g • Fat {{ meal.fat }}g
            </p>

            <button 
              @click="selectMeal(meal)"
              class="mt-4 bg-green-600 text-white w-full py-2 rounded-xl hover:bg-green-700"
            >
              Add Meal
            </button>
          </div>
        </div>

      </div>
    </section>


    <!-- Advice Section -->
    <section class="px-20 mt-16">
      <h2 class="text-2xl font-bold text-green-700 mb-4">Health Tips</h2>

      <div class="bg-white shadow-md rounded-2xl p-6 space-y-3">
        <p class="text-gray-700">• Stay hydrated — drink at least 6–8 cups of water daily.</p>
        <p class="text-gray-700">• Add vegetables to at least two meals per day.</p>
        <p class="text-gray-700">• Avoid processed snacks whenever possible.</p>
        <p class="text-gray-700">• Ensure high-quality sleep — 7 to 8 hours.</p>
      </div>
    </section>


    <!-- Meal Selection Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
    >
      <div class="bg-white rounded-2xl p-8 w-80 shadow-lg">
        <h2 class="text-xl font-bold text-center mb-4">Add to which meal?</h2>

        <div class="space-y-3">
          <button
            v-for="type in mealTypes"
            :key="type"
            @click="chooseMeal(type)"
            class="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
          >
            {{ type }}
          </button>
        </div>

        <button
          class="mt-6 w-full py-2 text-gray-600 hover:text-gray-800"
          @click="showModal = false"
        >
          Cancel
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// Suggested Meals Data
const meals = ref([
  {
    name: "Grilled Chicken Salad",
    calories: 320,
    protein: 32,
    carbs: 18,
    fat: 12,
    image: "/images/Grilled Chicken Salad.png"
  },
  {
    name: "Oatmeal with Fruits",
    calories: 280,
    protein: 8,
    carbs: 48,
    fat: 6,
    image: "/images/Oatmeal with Fruits.png"
  },
  {
    name: "Salmon with Veggies",
    calories: 450,
    protein: 34,
    carbs: 42,
    fat: 15,
    image: "/images/Salmon with Veggies.png"
  },
  {
    name: "Greek Yogurt Bowl",
    calories: 220,
    protein: 14,
    carbs: 28,
    fat: 5,
    image: "/images/Greek Yogurt Bowl.png"
  },
  {
    name: "Lentil Soup",
    calories: 260,
    protein: 17,
    carbs: 32,
    fat: 6,
    image: "/images/Lentil Soup.png"
  },
  {
    name: "Chicken Wrap",
    calories: 390,
    protein: 29,
    carbs: 44,
    fat: 10,
    image: "/images/Chicken Wrap.png"
  }
])

// Modal Logic
const showModal = ref(false)
const selectedMeal = ref(null)
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"]

function selectMeal(meal) {
  selectedMeal.value = meal
  showModal.value = true
}

function chooseMeal(type) {
  console.log("User selected meal:", selectedMeal.value, "→", type)
  showModal.value = false
}
</script>

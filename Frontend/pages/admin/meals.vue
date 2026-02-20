<template>
  <div class="min-h-screen bg-gray-100 flex">
    
    <!-- Main Panel -->
    <main class="flex-1 p-8">
      <h2 class="text-2xl font-bold mb-6">Meals Library</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="(meal, index) in meals" :key="index" class="bg-white rounded-xl shadow p-4 flex gap-4">
          <!-- Meal Image -->
          <div class="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
            <img v-if="meal.image" :src="meal.image" alt="Meal Image" class="w-full h-full object-cover" />
            <span v-else class="text-gray-400 text-sm flex items-center justify-center h-full">No Image</span>
          </div>

          <!-- Meal Info -->
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ meal.name }}</h3>
            <p class="text-sm text-gray-600">Calories: {{ meal.calories }} kcal</p>
            <p class="text-sm text-gray-600">
              P: {{ meal.protein }}g, C: {{ meal.carbs }}g, F: {{ meal.fat }}g
            </p>

            <!-- Actions -->
            <div class="flex gap-3 mt-2">
              <button class="text-blue-500 text-xs hover:underline">Edit</button>
              <button @click="deleteMeal(index)" class="text-red-500 text-xs hover:underline">Delete</button>
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
import { ref } from 'vue'

const meals = ref([
  { name: 'Grilled Chicken Salad', calories: 320, protein: 32, carbs: 12, fat: 12, image: '/images/grilled-chicken-salad.jpg' },
  { name: 'Oatmeal with Fruits', calories: 280, protein: 10, carbs: 48, fat: 6, image: '/images/oatmeal-fruits.jpg' },
  { name: 'Salmon with Veggies', calories: 420, protein: 34, carbs: 12, fat: 15, image: '/images/salmon-bowl.jpg' },
  { name: 'Greek Yogurt Bowl', calories: 260, protein: 14, carbs: 28, fat: 5, image: '/images/greek-yogurt.jpg' },
  { name: 'Lentil Soup', calories: 280, protein: 17, carbs: 32, fat: 5, image: '/images/lentil-soup.jpg' },
  { name: 'Chicken Wrap', calories: 390, protein: 29, carbs: 34, fat: 10, image: '/images/chicken-wrap.jpg' }
])

function deleteMeal(index) {
  meals.value.splice(index, 1)
}
</script>
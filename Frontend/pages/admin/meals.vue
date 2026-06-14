<template>
  <div class="min-h-screen bg-gray-100 flex">
    <main class="flex-1 p-8">
      
      <header class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">User Meals Log</h2>
        <p class="text-sm text-gray-500">Monitor and audit daily meal registrations across the system</p>
      </header>

      <div class="bg-white rounded-2xl shadow p-6 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b text-gray-400 text-xs uppercase bg-gray-50">
              <th class="p-3">Meal ID</th>
              <th class="p-3">User</th>
              <th class="p-3">Meal Type</th>
              <th class="p-3">Calories</th>
              <th class="p-3">Date</th>
              <th class="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="text-sm text-gray-700">
            <tr v-for="meal in meals" :key="meal.MealID" class="border-b last:border-none hover:bg-gray-50">
              <td class="p-3 font-semibold text-gray-500">#{{ meal.MealID }}</td>
              <td class="p-3 font-medium text-gray-800">
                {{ meal.FirstName ? `${meal.FirstName} ${meal.LastName}` : 'Unknown User' }}
              </td>
              <td class="p-3">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 capitalize">
                  {{ meal.MealType || 'N/A' }}
                </span>
              </td>
              <td class="p-3 font-semibold text-green-600">🔥 {{ meal.TotalCalories }} kcal</td>
              <td class="p-3 text-gray-500 text-xs">{{ formatDate(meal.Date) }}</td>
              <td class="p-3 text-center">
                <button @click="removeMeal(meal.MealID)" class="text-red-500 hover:text-red-700 text-xs font-medium">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="meals.length === 0" class="text-center py-8">
          <p class="text-gray-400 text-sm">No recorded user meals found in the database.</p>
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

// جلب البيانات من السيرفر
async function fetchMeals() {
  try {
    const res = await fetch(API)
    if (res.ok) {
      meals.value = await res.json()
    }
  } catch (error) {
    console.error("Error fetching meals:", error)
  }
}

// حذف سجل الوجبة
async function removeMeal(id) {
  if (!confirm("Are you sure you want to delete this meal record?")) return

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE"
    })
    if (res.ok) {
      meals.value = meals.value.filter(meal => meal.MealID !== id)
    }
  } catch (error) {
    console.error("Error deleting meal record:", error)
  }
}

// دالة بسيطة لتنسيق التاريخ ليظهر بشكل مقروء
function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchMeals()
})
</script>
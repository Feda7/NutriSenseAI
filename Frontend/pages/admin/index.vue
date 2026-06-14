<template>
  <div class="min-h-screen bg-gray-100 flex">
    <main class="flex-1 p-8">
      
      <header class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Welcome back, Admin! 🖥️</h2>
        <p class="text-sm text-gray-500">Here's what's happening with NutriSense today.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100">
          <div>
            <p class="text-sm font-medium text-gray-400 uppercase">Total Active Users</p>
            <h3 class="text-3xl font-bold text-gray-800 mt-1">{{ stats.usersCount }}</h3>
          </div>
          <div class="p-3 bg-blue-50 text-blue-500 rounded-xl text-xl">👥</div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100">
          <div>
            <p class="text-sm font-medium text-gray-400 uppercase">Available Diets</p>
            <h3 class="text-3xl font-bold text-gray-800 mt-1">{{ stats.dietsCount }}</h3>
          </div>
          <div class="p-3 bg-green-50 text-green-500 rounded-xl text-xl">🥗</div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100">
          <div>
            <p class="text-sm font-medium text-gray-400 uppercase">Total User Meals Logged</p>
            <h3 class="text-3xl font-bold text-gray-800 mt-1">{{ stats.mealsCount }}</h3>
          </div>
          <div class="p-3 bg-orange-50 text-orange-500 rounded-xl text-xl">🍳</div>
        </div>

      </div>

      <div class="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm">
        ✨ <strong>System Status:</strong> All background APIs and MySQL connection gates are operating healthily.
      </div>

    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin"
})

import { ref, onMounted } from "vue"

// كائن لتخزين الإحصائيات القادمة من قاعدة البيانات
const stats = ref({ usersCount: 0, dietsCount: 0, mealsCount: 0 })
const API = "http://localhost:5000/api/admin/overview"

async function fetchStats() {
  try {
    const res = await fetch(API)
    if (res.ok) {
      stats.value = await res.json()
    }
  } catch (error) {
    console.error("Error loading dashboard stats:", error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
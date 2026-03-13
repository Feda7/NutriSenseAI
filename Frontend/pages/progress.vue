<template>
  <div class="min-h-screen bg-gray-50 font-sans py-10 px-4">
    <!-- Header -->
    
      <div class="ml-20">
            <h2 class="text-3xl font-bold text-green-600 mb-8 ">Track Your Progress</h2>
        </div>
       
      
    

    <!-- Daily Summary Cards -->
    <section class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
      <div class="bg-white shadow-md rounded-2xl p-6 text-center">
        <h3 class="text-gray-500 font-medium">Calories</h3>
        <p class="text-2xl font-semibold text-green-600 mt-2">{{ todayCalories }} kcal</p>
        <p class="text-gray-400 text-sm mt-1">Today</p>
      </div>

      <div class="bg-white shadow-md rounded-2xl p-6 text-center">
        <h3 class="text-gray-500 font-medium">Protein</h3>
        <p class="text-2xl font-semibold text-green-600 mt-2">{{ todayProtein }} g</p>
        <p class="text-gray-400 text-sm mt-1">Today</p>
      </div>

      <div class="bg-white shadow-md rounded-2xl p-6 text-center">
        <h3 class="text-gray-500 font-medium">Carbs</h3>
        <p class="text-2xl font-semibold text-green-600 mt-2">{{ todayCarbs }} g</p>
        <p class="text-gray-400 text-sm mt-1">Today</p>
      </div>

      <div class="bg-white shadow-md rounded-2xl p-6 text-center">
        <h3 class="text-gray-500 font-medium">Fats</h3>
        <p class="text-2xl font-semibold text-green-600 mt-2">{{ todayFats }} g</p>
        <p class="text-gray-400 text-sm mt-1">Today</p>
      </div>

      <div class="bg-white shadow-md rounded-2xl p-6 text-center">
        <h3 class="text-gray-500 font-medium">Weight</h3>
        <p class="text-2xl font-semibold text-green-600 mt-2">{{ currentWeight }} kg</p>
        <p class="text-gray-400 text-sm mt-1">Latest</p>
      </div>
    </section>

    <!-- Monthly Progress Chart -->
    <section class="max-w-7xl mx-auto mb-10">
      <div class="bg-white shadow-md rounded-2xl p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Monthly Weight & Calories Progress</h2>
        <canvas id="progressChart" class="w-full h-64"></canvas>
      </div>
    </section>

    <!-- Monthly Nutrition Table -->
    <section class="max-w-7xl mx-auto">
      <div class="bg-white shadow-md rounded-2xl p-6 overflow-x-auto">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">Monthly Nutrition Log</h2>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calories</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protein</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carbs</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fats</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="(log, index) in monthlyLogs" :key="index" class="hover:bg-gray-50 transition">
              <td class="px-4 py-2 text-gray-700">{{ log.date }}</td>
              <td class="px-4 py-2 text-green-600 font-semibold">{{ log.calories }} kcal</td>
              <td class="px-4 py-2 text-gray-700">{{ log.protein }} g</td>
              <td class="px-4 py-2 text-gray-700">{{ log.carbs }} g</td>
              <td class="px-4 py-2 text-gray-700">{{ log.fats }} g</td>
              <td class="px-4 py-2 text-gray-700">{{ log.weight }} kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const monthlyLogs = ref([])
const todayCalories = ref(0)
const todayProtein = ref(0)
const todayCarbs = ref(0)
const todayFats = ref(0)
const currentWeight = ref(0)

const fetchProgress = async () => {
  // جلب الـ ID من التخزين المحلي
  const userData = JSON.parse(localStorage.getItem('user'))
  const userId = userData?.id
  if (!userId) return

  try {
    const res = await fetch(`http://localhost:5000/api/meal/progress/${userId}`)
    const data = await res.json()

    // توزيع البيانات الحقيقية
    todayCalories.value = Math.round(data.today.totalCalories)
    todayProtein.value = Math.round(data.today.totalProtein)
    todayCarbs.value = Math.round(data.today.totalCarbs)
    todayFats.value = Math.round(data.today.totalFat)
    currentWeight.value = data.goals.CurrentWeight || 0

    // تجهيز بيانات الجدول والمخطط
    monthlyLogs.value = data.history.map(log => ({
      date: new Date(log.date).toLocaleDateString(),
      calories: Math.round(log.calories),
      protein: Math.round(log.protein),
      carbs: Math.round(log.carbs),
      fats: Math.round(log.fats),
      weight: data.goals.CurrentWeight // يمكن تطويره لاحقاً لجدول الوزن
    }))

    renderChart()
  } catch (err) {
    console.error("Error fetching progress:", err)
  }
}

const renderChart = () => {
  const ctx = document.getElementById('progressChart').getContext('2d')
  // إذا كان المخطط موجوداً مسبقاً يجب حذفه لإعادة رسمه
  if (window.myChart) window.myChart.destroy()

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyLogs.value.map(log => log.date).reverse(),
      datasets: [{
        label: 'Calories Intake',
        data: monthlyLogs.value.map(log => log.calories).reverse(),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22,163,74,0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: { responsive: true }
  })
}

onMounted(() => {
  fetchProgress()
})
</script>
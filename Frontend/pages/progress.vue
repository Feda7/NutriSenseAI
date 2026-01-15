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
import { ref, onMounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// بيانات وهمية لشهر كامل
const monthlyLogs = ref([
  { date: '2025-11-01', calories: 2000, protein: 120, carbs: 250, fats: 70, weight: 70 },
  { date: '2025-11-02', calories: 2100, protein: 125, carbs: 260, fats: 72, weight: 70.1 },
  { date: '2025-11-03', calories: 2050, protein: 123, carbs: 255, fats: 71, weight: 70.2 },
  { date: '2025-11-04', calories: 1980, protein: 118, carbs: 248, fats: 69, weight: 70.2 },
  { date: '2025-11-05', calories: 2020, protein: 121, carbs: 252, fats: 70, weight: 70.3 },
  // أكمل بقية أيام الشهر
])

// البيانات اليومية تعتمد على آخر سجل (اليوم الحالي)
const todayLog = computed(() => monthlyLogs.value[monthlyLogs.value.length - 1])

const todayCalories = computed(() => todayLog.value.calories)
const todayProtein = computed(() => todayLog.value.protein)
const todayCarbs = computed(() => todayLog.value.carbs)
const todayFats = computed(() => todayLog.value.fats)
const currentWeight = computed(() => todayLog.value.weight)

onMounted(() => {
  const ctx = document.getElementById('progressChart').getContext('2d')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyLogs.value.map(log => log.date),
      datasets: [
        {
          label: 'Weight (kg)',
          data: monthlyLogs.value.map(log => log.weight),
          borderColor: '#16A34A',
          backgroundColor: 'rgba(22,163,74,0.2)',
          yAxisID: 'y1',
          tension: 0.3,
        },
        {
          label: 'Calories',
          data: monthlyLogs.value.map(log => log.calories),
          borderColor: 'gray',
          backgroundColor: 'rgba(156,163,175,0.2)',
          yAxisID: 'y2',
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      scales: {
        y1: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Weight (kg)' },
        },
        y2: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Calories' },
          grid: { drawOnChartArea: false },
        },
        x: { title: { display: true, text: 'Date' } },
      },
      plugins: { legend: { position: 'top' } },
    },
  })
})
</script>
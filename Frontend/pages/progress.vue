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
        <h2 class="text-xl font-semibold text-gray-800 mb-6"> Weight & Calories Progress</h2>
        <div style="position: relative; height: 400px; width: 100%;">
          <canvas id="progressChart"></canvas>
        </div>
      </div>
    </section>

    <!-- Monthly Nutrition Table -->
    <section class="max-w-7xl mx-auto">
      <div class="bg-white shadow-md rounded-2xl p-6 overflow-x-auto">
        <h2 class="text-xl font-semibold text-gray-800 mb-6"> Nutrition Log</h2>
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
  if (process.client) {
    try {
      const userRaw = localStorage.getItem('user'); 
      if (!userRaw) return;
      const userData = JSON.parse(userRaw);
      const currentUserId = userData.UserID || userData.id; 

      // الربط مع قاعدة البيانات الخاصة بمشروعك
      const res = await fetch(`http://localhost:5000/api/meal/progress/${currentUserId}`);
      if (!res.ok) throw new Error(`Server error`);
      const data = await res.json();
      
      // تحديث البيانات العلوية (اليوم الحالي)
      todayCalories.value = Number(data.today?.totalCalories || 0).toFixed(2);
      todayProtein.value  = Number(data.today?.totalProtein || 0).toFixed(2);
      todayCarbs.value    = Number(data.today?.totalCarbs || 0).toFixed(2);
      todayFats.value     = Number(data.today?.totalFat || 0).toFixed(2);
      currentWeight.value = data.goals?.CurrentWeight || 0;

      if (data.history) {
        // تجهيز البيانات للجدول وللرسم البياني (ربط حقيقي)
        monthlyLogs.value = data.history.map(log => ({
          date: log.date,
          calories: Math.round(log.calories),
          protein: parseFloat(log.protein).toFixed(1),
          carbs: parseFloat(log.carbs).toFixed(1),
          fats: parseFloat(log.fat || 0).toFixed(2),
          // نستخدم الوزن الحالي من الأهداف لكل نقطة في الرسم مؤقتاً 
          // أو الوزن التاريخي إذا كان موجوداً في الـ history الخاص بزميلتك
          weight: data.goals?.CurrentWeight || 0 
        })).reverse(); // نعكس الترتيب ليظهر من الأقدم للأحدث

        renderChart(); 
      }
    } catch (err) {
      console.error("خطأ في جلب بيانات التتبع:", err);
    }
  }
};

const renderChart = () => {
  const ctx = document.getElementById('progressChart')?.getContext('2d');
  if (!ctx) return;
  
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyLogs.value.map(log => log.date),
      datasets: [
        {
          label: 'Weight (kg)',
          data: monthlyLogs.value.map(log => log.weight),
          borderColor: '#16A34A',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          yAxisID: 'yWeight',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Calories',
          data: monthlyLogs.value.map(log => log.calories),
          borderColor: '#9CA3AF',
          backgroundColor: 'transparent',
          yAxisID: 'yCalories',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // لمنع الرسم من "التضخم" والخروج من الشاشة
      scales: {
        yWeight: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Weight (kg)' },
          // ضبط المقياس ليظهر الوزن بوضوح (حسب وزن المستخدم)
          suggestedMin: currentWeight.value - 5,
          suggestedMax: currentWeight.value + 5
        },
        yCalories: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Calories' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

onMounted(() => {
  fetchProgress();
});
</script>
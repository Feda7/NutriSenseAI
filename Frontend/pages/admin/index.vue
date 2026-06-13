<template>
  <div class="min-h-screen bg-gray-100 flex">

    <main class="flex-1 p-8">

      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Overview</h2>
          <p class="text-sm text-gray-500">Key statistics and recent activity</p>
        </div>
      </header>

      <section>

        <!-- Top Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-4 rounded-xl shadow">
            <div class="text-sm text-gray-500">Total Users</div>
            <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow">
            <div class="text-sm text-gray-500">Active Users</div>
            <div class="text-2xl font-bold">{{ stats.activeUsers }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow">
            <div class="text-sm text-gray-500">Total Meals</div>
            <div class="text-2xl font-bold">{{ stats.totalMeals }}</div>
          </div>

          <div class="bg-white p-4 rounded-xl shadow">
            <div class="text-sm text-gray-500">Avg Calories/day</div>
            <div class="text-2xl font-bold">{{ stats.avgCalories }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- LEFT -->
          <div class="col-span-2 space-y-4">

            <!-- Users by Diet -->
            <div class="bg-white rounded-2xl p-6 shadow">
              <h3 class="font-semibold mb-3">Users by Diet</h3>

              <div v-for="d in diets" :key="d.name" class="mb-3">
                <div class="text-xs text-gray-500">{{ d.name }}</div>

                <div class="bg-gray-100 rounded-full h-3 mt-1">
                  <div
                    class="bg-green-500 h-3 rounded-full"
                    :style="{ width: getDietPercent(d.name) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Health Conditions -->
            <div class="bg-white rounded-2xl p-6 shadow">
              <h3 class="font-semibold mb-3">Health Conditions</h3>

              <div class="grid grid-cols-2 gap-4">
                <div
                  v-for="c in healthList"
                  :key="c"
                  class="p-3 border rounded-lg text-sm"
                >
                  <div class="text-gray-500">{{ c }}</div>
                  <div class="font-semibold mt-2">
                    {{ usersByCondition[c] }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Daily Activity -->
            <div class="bg-white rounded-2xl p-6 shadow">
              <h3 class="font-semibold mb-3">Daily Activity (sample)</h3>

              <p class="text-sm text-gray-600">
                Meals added today:
                <span class="font-semibold">{{ todaysMealsCount }}</span>
              </p>

              <p class="text-sm text-gray-600 mt-1">
                Average protein per user today:
                <span class="font-semibold">{{ avgTodayProtein }} g</span>
              </p>

              <div class="mt-4 text-xs text-gray-400">
                *These numbers are demo data.
              </div>
            </div>

          </div>

          <!-- RIGHT -->
          <div class="space-y-4">

            <!-- Recent Users -->
            <div class="bg-white rounded-2xl p-4 shadow">
              <h4 class="font-semibold mb-2">Recent Users</h4>

              <ul class="space-y-2 text-sm">
                <li
                  v-for="u in recentUsers"
                  :key="u.email"
                  class="flex justify-between"
                >
                  <div>
                    <div class="font-medium">
                      {{ u.firstName }} {{ u.lastName }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ u.email }}
                    </div>
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ u.joinedAt }}
                  </div>
                </li>
              </ul>
            </div>

            <!-- Top Meals -->
            <div class="bg-white rounded-2xl p-4 shadow">
              <h4 class="font-semibold mb-2">Top Meals</h4>

              <ol class="list-decimal pl-5 text-sm space-y-1">
                <li v-for="m in topMeals" :key="m.name">
                  {{ m.name }}
                  <span class="text-xs text-gray-400">
                    ({{ m.count }} picks)
                  </span>
                </li>
              </ol>
            </div>

          </div>

        </div>

      </section>

    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin"
})
import { ref, computed, onMounted } from 'vue'

// 1. تعريف المتغيرات كـ مصفوفات فارغة في البداية لتستقبل بيانات قاعدة البيانات الحية
const users = ref([])
const meals = ref([])
const statsData = ref({ totalUsers: 0, activeUsers: 0, totalMeals: 0, avgCalories: 0 })
const usersByCondition = ref({ Hypertension: 0, Diabetes: 0, Colon: 0, Cholesterol: 0, None: 0 })

const diets = ref([
  { name: 'Bland' },
  { name: 'High-Protein' },
  { name: 'High-Fiber' },
  { name: 'Low-Saturated Fat' },
  { name: 'DASH' }
])

const healthList = ['Hypertension','Diabetes','Colon','Cholesterol','None']

// 2. دالة جلب البيانات الحية من الباكيند عند تحميل الصفحة
const fetchAdminDashboardData = async () => {
  try {
    // التعديل هنا: إضافة /meals قبل /dashboard لتطابق الـ app.js تماماً
    const response = await $fetch('http://localhost:5000/api/admin/meals/dashboard')
    
    users.value = response.users || []
    meals.value = response.meals || []
    statsData.value = response.stats || { totalUsers: 0, activeUsers: 0, totalMeals: 0, avgCalories: 2200 }
    usersByCondition.value = response.conditions || { Hypertension: 0, Diabetes: 0, Colon: 0, Cholesterol: 0, None: 0 }
  } catch (error) {
    console.error("❌ فشل جلب بيانات لوحة التحكم:", error)
  }
}

// تشغيل جلب البيانات فور دخول الآدمين للصفحة
onMounted(() => {
  fetchAdminDashboardData()
})

// 3. الحسابات الذكية المبنية على البيانات الحية والمستقبلة
const stats = computed(() => ({
  totalUsers: statsData.value.totalUsers || users.value.length,
  activeUsers: statsData.value.activeUsers || users.value.filter(u => u.active).length,
  totalMeals: statsData.value.totalMeals || meals.value.length,
  avgCalories: statsData.value.avgCalories || 2100
}))

function getDietPercent(name) {
  const count = users.value.filter(u => u.diet === name).length
  if (!stats.value.totalUsers) return 0
  return (count / stats.value.totalUsers) * 100
}

const recentUsers = computed(() => users.value.slice(0, 5)) // عرض آخر 5 مستخدمين فقط
const topMeals = computed(() => meals.value.sort((a, b) => b.count - a.count).slice(0, 5))

const todaysMealsCount = ref(0)
const avgTodayProtein = ref(0)
</script>
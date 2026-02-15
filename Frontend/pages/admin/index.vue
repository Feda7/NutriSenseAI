<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- SIDEBAR -->
    <aside class="w-72 bg-white shadow-md">
      <div class="p-6 border-b">
        <h1 class="text-xl font-bold text-green-600">NutriSense Admin</h1>
        <p class="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>

      <nav class="p-4">
        <ul class="space-y-1">
          <li v-for="item in menu" :key="item.key">
            <button
              @click="currentView = item.key"
              :class="['w-full text-left px-4 py-3 rounded-lg flex items-center gap-3',
                      currentView === item.key ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50']"
            >
              <span class="w-6 text-center text-gray-500">{{ item.icon }}</span>
              <span class="font-medium">{{ item.title }}</span>
              <span class="ml-auto text-xs text-gray-400" v-if="item.count !== undefined">{{ item.count }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t">
        <button @click="exportReport" class="w-full bg-green-600 text-white py-2 rounded-lg">Export CSV</button>
        <button @click="reset" class="w-full mt-3 text-sm border rounded-lg py-2">Reset Data</button>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8">
      <!-- header -->
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 capitalize">{{ viewTitleText }}</h2>
          <p class="text-sm text-gray-500">{{ viewSubtitleText }}</p>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-sm text-right">
            <div class="font-medium">{{ adminName }}</div>
            <div class="text-gray-500">Administrator</div>
          </div>
          <img src="#" alt="admin" class="w-12 h-12 rounded-full object-cover border" />
        </div>
      </header>

      <!-- VIEWS -->
      <section>
        <!-- DASHBOARD HOME -->
        <div v-if="currentView === 'overview'">
          <!-- Top Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <stat-card title="Total Users" :value="stats.totalUsers" icon="👥" />
            <stat-card title="Active Users (7d)" :value="stats.activeUsers" icon="✅" />
            <stat-card title="Total Meals" :value="stats.totalMeals" icon="🍽️" />
            <stat-card title="Avg Calories/day" :value="stats.avgCalories.toFixed(0)" icon="🔥" />
          </div>

          <!-- two columns: charts placeholders + lists -->
           
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="col-span-2 space-y-4">
              <div class="bg-white rounded-2xl p-6 shadow">
                <h3 class="font-semibold mb-3">Users by Diet</h3>
                <div class="flex items-center gap-4">
                  <div class="w-48">
                    <ul class="space-y-2 text-sm">
                      <li v-for="(d, idx) in diets" :key="d.name" class="flex justify-between">
                        <span>{{ d.n
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        ame }}</span>
                        <span class="font-semibold">{{ usersByDiet[d.name] || 0 }}</span>
                      </li>
                    </ul>
                  </div>
                  <div class="flex-1">
                    <!-- simple bar visual -->
                    <div class="space-y-2">
                      <div v-for="(d, idx) in diets" :key="d.name" class="w-full">
                        <div class="text-xs text-gray-500">{{ d.name }}</div>
                        <div class="bg-gray-100 rounded-full h-3 mt-1">
                          <div
                            class="bg-green-500 h-3 rounded-full"
                            :style="{ width: Math.min(100, (usersByDiet[d.name] || 0) / stats.totalUsers * 100) + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-2xl p-6 shadow">
                <h3 class="font-semibold mb-3">Health Conditions</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div v-for="c in healthList" :key="c" class="p-3 border rounded-lg text-sm">
                    <div class="text-gray-500">{{ c }}</div>
                    <div class="font-semibold mt-2">{{ usersByCondition[c] || 0 }}</div>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-2xl p-6 shadow">
                <h3 class="font-semibold mb-3">Daily Activity (sample)</h3>
                <p class="text-sm text-gray-600">Meals added today: <span class="font-semibold">{{ todaysMealsCount }}</span></p>
                <p class="text-sm text-gray-600 mt-1">Average protein per user today: <span class="font-semibold">{{ avgTodayProtein.toFixed(1) }} g</span></p>
                <div class="mt-4 text-xs text-gray-400">*These numbers are computed from demo data in this page.</div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-white rounded-2xl p-4 shadow">
                <h4 class="font-semibold mb-2">Recent Users</h4>
                <ul class="space-y-2 text-sm">
                  <li v-for="u in recentUsers" :key="u.email" class="flex items-center justify-between">
                    <div>
                      <div class="font-medium">{{ u.firstName }} {{ u.lastName }}</div>
                      <div class="text-xs text-gray-500">{{ u.email }}</div>
                    </div>
                    <div class="text-xs text-gray-400">{{ u.joinedAt }}</div>
                  </li>
                </ul>
              </div>

              <div class="bg-white rounded-2xl p-4 shadow">
                <h4 class="font-semibold mb-2">Top Meals</h4>
                <ol class="list-decimal pl-5 text-sm space-y-1">
                  <li v-for="m in topMeals" :key="m.name">{{ m.name }} <span class="text-xs text-gray-400">({{ m.count }} picks)</span></li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- USERS VIEW -->
        <div v-if="currentView === 'users'">
          <div class="bg-white rounded-2xl p-6 shadow mb-4">
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">All Users</h3>
              <input v-model="filters.userSearch" placeholder="Search email or name" class="border px-3 py-2 rounded-lg text-sm" />
            </div>

            <div class="mt-4">
              <table class="w-full text-sm">
                <thead class="text-left text-xs text-gray-500">
                  <tr>
                    <th class="pb-2">Name</th>
                    <th>Email</th>
                    <th>Diet</th>
                    <th>Conditions</th>
                    <th>Joined</th>
                    <th class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in filteredUsers" :key="u.email" class="border-t">
                    <td class="py-3">{{ u.firstName }} {{ u.lastName }}</td>
                    <td>{{ u.email }}</td>
                    <td>{{ u.diet || '-' }}</td>
                    <td>{{ (u.medical.length ? u.medical.join(', ') : 'None') }}</td>
                    <td>{{ u.joinedAt }}</td>
                    <td class="text-right">
                      <button @click="toggleActive(u)" class="text-xs px-2 py-1 rounded bg-green-50 text-green-700 mr-2">
                        {{ u.active ? 'Active' : 'Activate' }}
                      </button>
                      <button @click="deleteUser(u.email)" class="text-xs px-2 py-1 rounded bg-red-50 text-red-600">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- DIETS VIEW -->
        <div v-if="currentView === 'diets'">
          <div class="bg-white rounded-2xl p-6 shadow">
            <h3 class="font-semibold mb-4">Diets (editable)</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="d in diets" :key="d.name" class="p-4 border rounded-lg">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium">{{ d.name }}</div>
                    <div class="text-xs text-gray-500">{{ d.description }}</div>
                    <div class="text-xs text-gray-600 mt-2">Macro: {{ d.macro }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-semibold">{{ usersByDiet[d.name] || 0 }} users</div>
                    <button @click="editDiet(d)" class="mt-3 text-xs px-2 py-1 rounded bg-blue-50 text-blue-600">Edit</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Diet button -->
            <div class="mt-4">
              <button @click="openAddDiet" class="bg-green-600 text-white px-4 py-2 rounded-lg">Add Diet</button>
            </div>
          </div>
        </div>

        <!-- MEALS VIEW -->
        <div v-if="currentView === 'meals'">
          <div class="bg-white rounded-2xl p-6 shadow mb-4">
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">Meals Library</h3>
              <div class="flex items-center gap-3">
                <input v-model="filters.mealSearch" placeholder="Search meals..." class="border px-3 py-2 rounded-lg text-sm" />
                <button @click="openAddMeal" class="bg-green-600 text-white px-3 py-2 rounded-lg">Add Meal</button>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="m in filteredMeals" :key="m.name" class="bg-gray-50 rounded-lg p-3 border">
                <img :src="m.image" class="w-full h-36 object-cover rounded-lg mb-2" />
                <div class="font-medium">{{ m.name }}</div>
                <div class="text-xs text-gray-600">Calories: {{ m.calories }} kcal</div>
                <div class="text-xs text-gray-600">P:{{ m.protein }}g • C:{{ m.carbs }}g • F:{{ m.fat }}g</div>

                <div class="flex gap-2 mt-3">
                  <button @click="openEditMeal(m)" class="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600">Edit</button>
                  <button @click="removeMeal(m.name)" class="text-xs px-2 py-1 rounded bg-red-50 text-red-600">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- REPORTS VIEW -->
        <div v-if="currentView === 'reports'">
          <div class="bg-white rounded-2xl p-6 shadow">
            <h3 class="font-semibold">Reports</h3>
            <p class="text-sm text-gray-600 mt-2">This area can show recommendation logs, warnings, and admin notes.</p>

            <div class="mt-4">
              <table class="w-full text-sm">
                <thead class="text-xs text-gray-500 text-left">
                  <tr><th>Date</th><th>User</th><th>Type</th><th>Message</th></tr>
                </thead>
                <tbody>
                  <tr v-for="r in reports" :key="r.id" class="border-t">
                    <td class="py-2">{{ r.date }}</td>
                    <td>{{ r.user }}</td>
                    <td>{{ r.type }}</td>
                    <td>{{ r.msg }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ADMIN TOOLS -->
        <div v-if="currentView === 'tools'">
          <div class="bg-white rounded-2xl p-6 shadow">
            <h3 class="font-semibold">Admin Tools</h3>
            <p class="text-sm text-gray-600 mt-2">Quick actions for admins (demo).</p>

            <div class="mt-4 flex gap-3">
              <button @click="openAddMeal" class="bg-green-600 text-white px-4 py-2 rounded-lg">Add Meal</button>
              <button @click="openAddDiet" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Add Diet</button>
              <button @click="exportReport" class="bg-gray-800 text-white px-4 py-2 rounded-lg">Export</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <!-- Add / Edit Meal Modal -->
  <div v-if="modal.mealOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl w-96 p-6 shadow-lg">
      <h3 class="font-semibold mb-3">{{ modal.editing ? 'Edit Meal' : 'Add Meal' }}</h3>

      <div class="space-y-3">
        <input v-model="modal.form.name" placeholder="Meal name" class="w-full border px-3 py-2 rounded-lg" />
        <input v-model.number="modal.form.calories" placeholder="Calories" class="w-full border px-3 py-2 rounded-lg" />
        <div class="grid grid-cols-3 gap-3">
          <input v-model.number="modal.form.protein" placeholder="Protein g" class="border px-3 py-2 rounded-lg" />
          <input v-model.number="modal.form.carbs" placeholder="Carbs g" class="border px-3 py-2 rounded-lg" />
          <input v-model.number="modal.form.fat" placeholder="Fat g" class="border px-3 py-2 rounded-lg" />
        </div>
        <input v-model="modal.form.image" placeholder="Image URL (or /images/...)" class="w-full border px-3 py-2 rounded-lg" />

        <div class="flex justify-end gap-2 mt-3">
          <button @click="closeMealModal" class="px-3 py-2 rounded-lg border">Cancel</button>
          <button @click="saveMeal" class="px-3 py-2 rounded-lg bg-green-600 text-white">{{ modal.editing ? 'Save' : 'Add' }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add / Edit Diet Modal -->
  <div v-if="modal.dietOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-2xl w-96 p-6 shadow-lg">
      <h3 class="font-semibold mb-3">{{ modal.editingDiet ? 'Edit Diet' : 'Add Diet' }}</h3>

      <div class="space-y-3">
        <input v-model="modal.dietForm.name" placeholder="Diet name" class="w-full border px-3 py-2 rounded-lg" />
        <input v-model="modal.dietForm.macro" placeholder="Macro string e.g. Protein 30-40% • Carbs 30-40%" class="w-full border px-3 py-2 rounded-lg" />
        <textarea v-model="modal.dietForm.description" rows="3" placeholder="Short description" class="w-full border px-3 py-2 rounded-lg"></textarea>

        <div class="flex justify-end gap-2 mt-3">
          <button @click="closeDietModal" class="px-3 py-2 rounded-lg border">Cancel</button>
          <button @click="saveDiet" class="px-3 py-2 rounded-lg bg-green-600 text-white">{{ modal.editingDiet ? 'Save' : 'Add' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

/* ---------- admin name ---------- */
const adminName = 'Admin User'

/* ---------- sidebar menu ---------- */
const menu = [
  { key: 'overview', title: 'Overview', icon: '🏠' },
  { key: 'users', title: 'Users', icon: '👥' },
  { key: 'diets', title: 'Diets', icon: '🥗' },
  { key: 'meals', title: 'Meals', icon: '🍽️' },
  { key: 'reports', title: 'Reports', icon: '📄' },
  { key: 'tools', title: 'Admin Tools', icon: '🛠️' }
]

/* ---------- current view ---------- */
const currentView = ref('overview')

/* ---------- data: users, diets, meals, reports ---------- */
/* users sample */
const users = ref([
  { email: 'fidaa@example.com', firstName: 'Fidaa', lastName: 'Bin', joinedAt: '2025-07-03', diet: 'Low-Saturated Fat', medical: ['None'], active: true },
  { email: 'ahmed@example.com', firstName: 'Ahmed', lastName: 'Al', joinedAt: '2025-07-05', diet: 'High-Protein', medical: ['Diabetes'], active: true },
  { email: 'sara@example.com', firstName: 'Sara', lastName: 'K', joinedAt: '2025-07-10', diet: 'Bland', medical: ['Colon'], active: false },
  { email: 'moh@example.com', firstName: 'Moh', lastName: 'A', joinedAt: '2025-07-12', diet: 'DASH', medical: ['Hypertension'], active: true }
])

/* diets initial (use your five) */
const diets = ref([
  { name: 'Bland', description: 'Light diet for stomach/colon issues', macro: 'Carbs 50–60% • Protein 15–20% • Fat 20–30%' },
  { name: 'High-Protein', description: 'Increase protein for muscle & satiety', macro: 'Protein 30–40% • Carbs 30–40% • Fat 20–30%' },
  { name: 'High-Fiber', description: 'Increase fiber for digestion', macro: 'Carbs 45–55% • Fiber ≥25g/day' },
  { name: 'Low-Saturated Fat', description: 'Reduce saturated fat for heart', macro: 'Fat 20–30% (Sat <7%)' },
  { name: 'DASH', description: 'Dietary approach for hypertension', macro: 'Carbs 50–55% • Protein ~20% • Fat 25–30%' }
])

/* meals sample */
const meals = ref([
  { name: 'Grilled Chicken Salad', calories: 320, protein: 32, carbs: 18, fat: 12, image: '/images/Grilled Chicken Salad.png', count: 12 },
  { name: 'Oatmeal with Fruits', calories: 280, protein: 8, carbs: 48, fat: 6, image: '/images/Oatmeal with Fruits.png', count: 9 },
  { name: 'Salmon with Veggies', calories: 450, protein: 34, carbs: 42, fat: 15, image: '/images/Salmon with Veggies.png', count: 7 },
  { name: 'Greek Yogurt Bowl', calories: 220, protein: 14, carbs: 28, fat: 5, image: '/images/Greek Yogurt Bowl.png', count: 5 },
  { name: 'Lentil Soup', calories: 260, protein: 17, carbs: 32, fat: 6, image: '/images/Lentil Soup.png', count: 6 },
  { name: 'Chicken Wrap', calories: 390, protein: 29, carbs: 44, fat: 10, image: '/images/Chicken Wrap.png', count: 11 }
])

/* reports demo */
const reports = ref([
  { id: 1, date: '2025-11-01', user: 'fidaa@example.com', type: 'warning', msg: 'High fat intake today' },
  { id: 2, date: '2025-11-02', user: 'ahmed@example.com', type: 'info', msg: 'Balanced meals logged' }
])

/* ---------- computed stats ---------- */
const stats = computed(() => {
  const totalUsers = users.value.length
  const activeUsers = users.value.filter(u => u.active).length
  const totalMeals = meals.value.length
  const allCalories = usersMealsSampleCalories() // approximate demo
  const avgCalories = allCalories.length ? allCalories.reduce((a,b)=>a+b,0)/allCalories.length : 0
  return { totalUsers, activeUsers, totalMeals, avgCalories }
})

function usersMealsSampleCalories(){
  // demo: pretend each user consumed some meals today (use meal counts)
  return users.value.map((u, idx)=> {
    const m = meals.value[idx % meals.value.length]
    return m ? m.calories : 0
  })
}

/* users by diet */
const usersByDiet = computed(() => {
  const map = {}
  diets.value.forEach(d => (map[d.name] = 0))
  users.value.forEach(u => {
    if (u.diet && map[u.diet] !== undefined) map[u.diet]++
    else map['No Diet'] = (map['No Diet'] || 0) + 1
  })
  return map
})

/* users by condition */
const healthList = ['Hypertension','Diabetes','Colon','Cholesterol','None']
const usersByCondition = computed(() => {
  const map = {}
  healthList.forEach(h => map[h] = 0)
  users.value.forEach(u => {
    if (!u.medical || u.medical.length===0) map['None']++
    else u.medical.forEach(m => map[m] = (map[m]||0)+1)
  })
  return map
})

/* todays metrics (demo) */
const todaysMealsCount = computed(() => {
  // demo compute: sum of meal counts today
  return meals.value.reduce((s,m)=>s+(m.count||0),0) % 50
})
const avgTodayProtein = computed(()=> {
  const all = usersMealsSampleCalories().length ? usersMealsSampleCalories().map((_,i)=> meals.value[i%meals.value.length].protein) : []
  return all.length ? all.reduce((a,b)=>a+b,0)/all.length : 0
})

/* recent users and top meals */
const recentUsers = computed(()=> users.value.slice().sort((a,b)=> b.joinedAt.localeCompare(a.joinedAt)).slice(0,5))
const topMeals = computed(()=> meals.value.slice().sort((a,b)=> (b.count||0)-(a.count||0)).slice(0,5))

/* filters */
const filters = reactive({ userSearch: '', mealSearch: '' })

const filteredUsers = computed(()=> {
  const q = filters.userSearch.toLowerCase()
  return users.value.filter(u => !q || (u.email+u.firstName+u.lastName).toLowerCase().includes(q))
})
const filteredMeals = computed(()=> {
  const q = filters.mealSearch.toLowerCase()
  return meals.value.filter(m => !q || m.name.toLowerCase().includes(q))
})

/* meals stats for top area */
const statsOwner = stats

/* helpers for UI */
function toggleActive(u){
  u.active = !u.active
}
function deleteUser(email){
  const idx = users.value.findIndex(x=>x.email===email)
  if(idx>-1) users.value.splice(idx,1)
}

/* meal CRUD */
const modal = reactive({
  mealOpen: false,
  editing: false,
  form: { name:'', calories:0, protein:0, carbs:0, fat:0, image:'' },
  dietOpen: false,
  dietForm: { name:'', macro:'', description:'' },
  editingDiet: false
})


function openAddMeal(){
  modal.editing = false
  modal.form = { name:'', calories:0, protein:0, carbs:0, fat:0, image:'' }
  modal.mealOpen = true
}
function openEditMeal(m){
  modal.editing = true
  modal.form = { ...m }
  modal.mealOpen = true
}
function closeMealModal(){ modal.mealOpen = false; modal.editing=false }
function saveMeal(){
  if(!modal.form.name) return alert('Please enter meal name')
  if(modal.editing){
    const idx = meals.value.findIndex(x=>x.name===modal.form.name)
    if(idx>-1) meals.value[idx] = { ...modal.form }
    else {
      // if name changed, match by previous name? in demo keep simple
      const found = meals.value.find(x=>x.name===modal.form.name)
      if(!found) meals.value.push({...modal.form})
    }
  } else {
    meals.value.push({...modal.form, count:0})
  }
  modal.mealOpen = false
}

/* diet modal */
function openAddDiet(){
  modal.editingDiet = false
  modal.dietForm = { name:'', macro:'', description:'' }
  modal.dietOpen = true
}
function editDiet(d){
  modal.editingDiet = true
  modal.dietForm = { ...d }
  modal.dietOpen = true
}
function closeDietModal(){ modal.dietOpen = false; modal.editingDiet=false }
function saveDiet(){
  if(!modal.dietForm.name) return alert('Enter diet name')
  if(modal.editingDiet){
    const idx = diets.value.findIndex(x=>x.name===modal.dietForm.name)
    if(idx>-1) diets.value[idx] = { ...modal.dietForm }
  } else {
    diets.value.push({ ...modal.dietForm })
  }
  modal.dietOpen = false
}

/* remove meal */
function removeMeal(name){
  const i = meals.value.findIndex(x=>x.name===name)
  if(i>-1) meals.value.splice(i,1)
}

/* admin actions */
function exportReport(){
  const csv = [
    ['email','firstName','lastName','diet','medical'].join(','),
    ...users.value.map(u=> [u.email,u.firstName,u.lastName, (u.diet||''), (u.medical||[]).join('|')].join(','))
  ].join('\n')

  // download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'users_export.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* reset demo data */
function resetDemo(){
  if(!confirm('Reset demo data?')) return
  users.value = [
    { email: 'fidaa@example.com', firstName: 'Fidaa', lastName: 'Bin', joinedAt: '2025-07-03', diet: 'Low-Saturated Fat', medical: ['None'], active: true },
    { email: 'ahmed@example.com', firstName: 'Ahmed', lastName: 'Al', joinedAt: '2025-07-05', diet: 'High-Protein', medical: ['Diabetes'], active: true },
    { email: 'sara@example.com', firstName: 'Sara', lastName: 'K', joinedAt: '2025-07-10', diet: 'Bland', medical: ['Colon'], active: false },
    { email: 'moh@example.com', firstName: 'Moh', lastName: 'A', joinedAt: '2025-07-12', diet: 'DASH', medical: ['Hypertension'], active: true }
  ]
  meals.value = [
    { name: 'Grilled Chicken Salad', calories: 320, protein: 32, carbs: 18, fat: 12, image: '/images/grilled-chicken-salad.jpg', count: 12 },
    { name: 'Oatmeal with Fruits', calories: 280, protein: 8, carbs: 48, fat: 6, image: '/images/oatmeal-fruits.jpg', count: 9 },
    { name: 'Salmon with Veggies', calories: 450, protein: 34, carbs: 42, fat: 15, image: '/images/salmon-bowl.jpg', count: 7 },
    { name: 'Greek Yogurt Bowl', calories: 220, protein: 14, carbs: 28, fat: 5, image: '/images/greek-yogurt.jpg', count: 5 },
    { name: 'Lentil Soup', calories: 260, protein: 17, carbs: 32, fat: 6, image: '/images/lentil-soup.jpg', count: 6 },
    { name: 'Chicken Wrap', calories: 390, protein: 29, carbs: 44, fat: 10, image: '/images/chicken-wrap.jpg', count: 11 }
  ]
}

/* small helpers */
function viewTitle(){
  return {
    overview: 'Overview',
    users: 'Users',
    diets: 'Diets',
    meals: 'Meals',
    reports: 'Reports',
    tools: 'Admin Tools'
  }[currentView.value]
}
const viewTitleComputed = computed(()=> viewTitle())

function viewSubtitle(){
  return {
    overview: 'Key statistics and recent activity',
    users: 'Manage users accounts & activation',
    diets: 'Manage diet templates and macros',
    meals: 'Add/edit meals available in library',
    reports: 'System recommendation logs & warnings',
    tools: 'Quick admin actions'
  }[currentView.value]
}
const viewSubtitleComputed = computed(()=> viewSubtitle())

/* small computed wrappers for template binding */
const statsWrapper = stats
const usersByDietWrapper = usersByDiet
const usersByConditionWrapper = usersByCondition

/* expose small computed values used in template */
const viewTitleText = viewTitleComputed
const viewSubtitleText = viewSubtitleComputed

/* expose to template */
const todaysMealsCountWrapper = todaysMealsCount
const avgTodayProteinWrapper = avgTodayProtein

/* convenience computed used directly in template */
const topMealsComputed = topMeals
const recentUsersComputed = recentUsers
const filteredMealsComputed = filteredMeals
const filteredUsersComputed = filteredUsers

// export the small components used in template
</script>

<script>
// local child component registration (stat-card)
export default {
  components: {
    statCard: {
      props: ['title','value','icon'],
      template: `
        <div class="bg-white rounded-2xl p-5 shadow text-center">
          <div class="text-3xl">{{ icon }}</div>
          <div class="text-xs text-gray-500 mt-2">{{ title }}</div>
          <div class="text-2xl font-bold text-green-600 mt-2">{{ value }}</div>
        </div>
      `
    }
  }
}
</script>

<style scoped>
/* small responsive tweaks */
@media (max-width: 900px) {
  aside { display: none; } /* in your real project you might collapse to a hamburger */
}
</style>
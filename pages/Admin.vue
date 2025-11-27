<!-- pages/admin.vue -->
<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Header -->
    <header class="bg-green-600 text-white px-6 py-4 flex justify-between items-center shadow">
      <h1 class="text-xl font-bold">NutriSenseAI — Admin Dashboard</h1>
      <button @click="logout" class="bg-white text-green-700 px-4 py-1 rounded">Logout</button>
    </header>


    <!-- Tabs Navigation -->
    <nav class="bg-white shadow px-6 py-3 flex gap-4 border-b">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="currentTab = tab"
        :class="[
          'px-4 py-2 rounded font-medium',
          currentTab === tab ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        {{ tab }}
      </button>
    </nav>


    <!-- Main Content -->
    <main class="p-6">
      <!-- Overview -->
      <section v-if="currentTab === 'Overview'" class="grid md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow text-center">
          <p class="text-gray-500">Total Users</p>
          <p class="text-3xl font-bold text-green-600">124</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow text-center">
          <p class="text-gray-500">Meals Added</p>
          <p class="text-3xl font-bold text-green-600">842</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow text-center">
          <p class="text-gray-500">Avg Calories</p>
          <p class="text-3xl font-bold text-green-600">1950</p>
        </div>
      </section>


      <!-- Users -->
      <section v-if="currentTab === 'Users'" class="bg-white p-6 rounded-2xl shadow">
        <h2 class="text-xl font-bold text-green-700 mb-4">Users Management</h2>
        <table class="w-full text-left border">
          <thead class="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th class="p-2">Name</th>
              <th class="p-2">Email</th>
              <th class="p-2">Status</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.email" class="border-t hover:bg-gray-50">
              <td class="p-2">{{ user.name }}</td>
              <td class="p-2">{{ user.email }}</td>
              <td class="p-2">
                <span :class="user.active ? 'text-green-600' : 'text-gray-400'">
                  {{ user.active ? 'Active' : 'Disabled' }}
                </span>
              </td>
              <td class="p-2">
                <button @click="toggleUser(user)" class="text-sm text-green-600 hover:underline">
                  {{ user.active ? 'Disable' : 'Enable' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>


      <!-- Content -->
      <section v-if="currentTab === 'Content'" class="grid md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow">
          <h2 class="text-lg font-semibold mb-3">Suggested Meals</h2>
          <ul class="space-y-2">
            <li v-for="meal in meals" :key="meal" class="flex justify-between border p-2 rounded">
              <span>{{ meal }}</span>
              <button class="text-sm text-green-600 hover:underline">Edit</button>
            </li>
          </ul>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow">
          <h2 class="text-lg font-semibold mb-3">Health Tips</h2>
          <ul class="space-y-2">
            <li v-for="tip in tips" :key="tip" class="flex justify-between border p-2 rounded">
              <span>{{ tip }}</span>
              <button class="text-sm text-green-600 hover:underline">Edit</button>
            </li>
          </ul>
        </div>
      </section>


      <!-- Settings -->
      <section v-if="currentTab === 'Settings'" class="bg-white p-6 rounded-2xl shadow max-w-xl">
        <h2 class="text-xl font-bold text-green-700 mb-4">System Settings</h2>
        <div class="mb-4">
          <label class="block text-gray-600 mb-1">Default Daily Calories</label>
          <input type="number" v-model="defaultCalories" class="border rounded px-3 py-2 w-full" />
        </div>
        <div>
          <label class="block text-gray-600 mb-1">Diet Types</label>
          <div class="flex flex-wrap gap-2">
            <span v-for="diet in dietTypes" :key="diet" class="bg-gray-100 px-3 py-1 rounded">{{ diet }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>


<script setup>
import { ref } from 'vue'


const tabs = ['Overview', 'Users', 'Content', 'Settings']
const currentTab = ref('Overview')


const users = ref([
  { name: 'Fedaa', email: 'fedaa@example.com', active: true },
  { name: 'Sara', email: 'sara@example.com', active: false },
])


function toggleUser(user) {
  user.active = !user.active
}


const meals = ref([
  'Grilled Chicken Salad',
  'Oatmeal with Fruits',
  'Salmon with Veggies',
])


const tips = ref([
  'Drink 8 cups of water daily.',
  'Add vegetables to your meals.',
  'Avoid processed snacks.',
])


const defaultCalories = ref(1900)
const dietTypes = ref(['Bland', 'High-Protein', 'DASH'])


function logout() {
  alert('Logged out (demo only)')
}
</script>


<style scoped>
button:focus {
  outline: none;
}
</style>
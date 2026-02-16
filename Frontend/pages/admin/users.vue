<template>
  <div class="min-h-screen bg-gray-100 flex">

    <!-- SIDEBAR -->
    <aside class="w-72 bg-white shadow-md">
      <div class="p-6 border-b">
        <h1 class="text-xl font-bold text-green-600">NutriSense Admin</h1>
        <p class="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8">

      <!-- Header -->
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Users</h2>
          <p class="text-sm text-gray-500">Manage registered users</p>
        </div>
      </header>

      <!-- Users Table Card -->
      <div class="bg-white rounded-2xl shadow p-6">

        <div class="overflow-x-auto">
          <table class="w-full text-sm">

            <thead>
              <tr class="text-left border-b text-gray-500">
                <th class="pb-3">Name</th>
                <th class="pb-3">Email</th>
                <th class="pb-3">Diet</th>
                <th class="pb-3">Medical</th>
                <th class="pb-3">Status</th>
                <th class="pb-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="u in users"
                :key="u.email"
                class="border-b last:border-none"
              >
                <td class="py-3 font-medium">
                  {{ u.firstName }} {{ u.lastName }}
                </td>

                <td class="py-3 text-gray-600">
                  {{ u.email }}
                </td>

                <td class="py-3">
                  <span class="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                    {{ u.diet }}
                  </span>
                </td>

                <td class="py-3 text-xs text-gray-600">
                  {{ u.medical.join(', ') }}
                </td>

                <td class="py-3">
                  <span
                    :class="u.active
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'"
                    class="text-xs px-2 py-1 rounded-full"
                  >
                    {{ u.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <td class="py-3 text-right">
                  <button
                    @click="toggleUser(u)"
                    :class="u.active
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'"
                    class="text-white text-xs px-3 py-1 rounded-lg transition"
                  >
                    {{ u.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>

          </table>
        </div>

      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  {
    firstName: 'Moh',
    lastName: 'A',
    email: 'moh@example.com',
    diet: 'Bland',
    medical: ['Hypertension'],
    active: true
  },
  {
    firstName: 'Sara',
    lastName: 'K',
    email: 'sara@example.com',
    diet: 'High-Protein',
    medical: ['Diabetes'],
    active: true
  },
  {
    firstName: 'Ahmed',
    lastName: 'Al',
    email: 'ahmed@example.com',
    diet: 'Low-Saturated Fat',
    medical: ['None'],
    active: false
  }
])

function toggleUser(user) {
  user.active = !user.active
}
</script>

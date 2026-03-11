<script setup>
definePageMeta({
  layout: 'admin'
})

import { ref, onMounted } from 'vue'

const users = ref([])

const getUsers = async () => {
  try {
const res = await fetch("http://localhost:5000/api/users")
    const data = await res.json()
    users.value = data
  } catch (error) {
    console.error("Error fetching users:", error)
  }
}

const deleteUser = async (id) => {
  try {
await fetch(`http://localhost:5000/api${id}`, {
        method: "DELETE"
    })
    getUsers()
  } catch (error) {
    console.error("Error deleting user:", error)
  }
}

onMounted(() => {
  getUsers()
})
</script>

<template>
  <div>
    <header class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Users</h2>
    </header>

    <div class="bg-white rounded-2xl shadow p-6">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">

          <thead>
            <tr class="text-left border-b text-gray-500">
              <th class="pb-3">ID</th>
              <th class="pb-3">Name</th>
              <th class="pb-3">Email</th>
              <th class="pb-3">Status</th>
              <th class="pb-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="u in users"
              :key="u.UserID"
              class="border-b last:border-none"
            >
              <td class="py-3">{{ u.UserID }}</td>

              <td class="py-3 font-medium">
                {{ u.FirstName }} {{ u.LastName }}
              </td>

              <td class="py-3 text-gray-600">
                {{ u.Email }}
              </td>

              <td class="py-3">
                <span
                  :class="u.Active == 1
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'"
                  class="text-xs px-2 py-1 rounded-full"
                >
                  {{ u.Active == 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td class="py-3 text-right">
                <button
                  @click="deleteUser(u.UserID)"
                  class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>

        </table>
      </div>
    </div>
  </div>
</template>
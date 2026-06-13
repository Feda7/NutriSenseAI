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
  if (confirm("هل أنتِ متأكدة من حذف هذا المستخدم نهائياً؟")) {
    try {
      await fetch(`http://localhost:5000/api/users/${id}`, {
          method: "DELETE"
      })
      getUsers() // إعادة تحديث الجدول فوراً بعد الحذف بنجاح
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }
}

onMounted(() => {
  getUsers()
})
</script>

<template>
  <div>
    <header class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Users Management</h2>
    </header>

    <div class="bg-white rounded-2xl shadow p-6">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead>
            <tr class="border-b text-gray-500">
              <th class="pb-3">ID</th>
              <th class="pb-3">Name</th>
              <th class="pb-3">Email</th>
              <th class="pb-3">Gender</th>
              <th class="pb-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="u in users"
              :key="u.id"
              class="border-b last:border-none hover:bg-gray-50 transition"
            >
              <td class="py-3">{{ u.id }}</td>
              <td class="py-3 font-medium">{{ u.name }}</td>
              <td class="py-3 text-gray-600">{{ u.email }}</td>
              <td class="py-3">
                <span 
                  :class="u.gender === 'Female' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'"
                  class="text-xs px-2 py-1 rounded-full font-medium capitalize"
                >
                  {{ u.gender || 'Not Specified' }}
                </span>
              </td>

              <td class="py-3 text-right">
                <button
                  @click="deleteUser(u.id)"
                  class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="text-center py-8 text-gray-400">
          <span class="block text-2xl mb-2">👥</span>
          No Registered Users Found.
        </div>
      </div>
    </div>
  </div>
</template>
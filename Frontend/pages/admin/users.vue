<template>
  <div class="min-h-screen bg-gray-100 flex">
    <main class="flex-1 p-8">
      <header class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Users Management</h2>
        <p class="text-sm text-gray-500">Manage registered system users</p>
      </header>

      <div class="bg-white rounded-2xl shadow p-6 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b text-gray-400 text-xs uppercase bg-gray-50">
              <th class="p-3">ID</th>
              <th class="p-3">Full Name</th>
              <th class="p-3">Email</th>
              <th class="p-3">Gender</th>
              <th class="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="text-sm text-gray-700">
            <tr v-for="user in users" :key="user.UserID" class="border-b last:border-none hover:bg-gray-50">
              <td class="p-3 font-semibold text-gray-500">#{{ user.UserID }}</td>
              <td class="p-3 font-medium text-gray-800">{{ user.FirstName }} {{ user.LastName }}</td>
              <td class="p-3 text-gray-600">{{ user.Email }}</td>
              <td class="p-3">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 capitalize">
                  {{ user.Gender || 'N/A' }}
                </span>
              </td>
              <td class="p-3 text-center">
                <button @click="removeUser(user.UserID)" class="text-red-500 hover:text-red-700 font-medium text-xs">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="text-center py-8">
          <p class="text-gray-400 text-sm">No Registered Users Found.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin"
})

import { ref, onMounted } from "vue"

const users = ref([])
const API = "http://localhost:5000/api/admin/users"

// جلب المستخدمين من السيرفر
async function fetchUsers() {
  try {
    const res = await fetch(API)
    if (res.ok) {
      users.value = await res.json()
    }
  } catch (error) {
    console.error("Error loading users:", error)
  }
}

// دالة حذف حساب مستخدم
async function removeUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return
  
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE"
    })
    if (res.ok) {
      // إزالة العنصر من المصفوفة لتحديث الواجهة فوراً
      users.value = users.value.filter(user => user.UserID !== id)
    }
  } catch (error) {
    console.error("Error deleting user:", error)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-green-700">NutriSense Admin</h2>
        <p class="text-sm text-gray-500 mt-1">Please log in to the dashboard</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input v-model="email" type="email" required class="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-green-500" placeholder="admin@nutrisense.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-green-500" placeholder="••••••••" />
        </div>

        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition duration-250">
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
// This magic line disables the default layout (Navbar and Footer) for this page
definePageMeta({
  layout: false
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

async function handleLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const data = await response.json()
    if (data.success) {
      // Save login state in sessionStorage (session-only)
      sessionStorage.setItem('adminToken', data.token)
      // Redirect to the admin dashboard instantly
      router.push('/admin')
    } else {
      alert(data.error)
    }
  } catch (error) {
    alert("An error occurred while connecting to the server!")
  }
}
</script>
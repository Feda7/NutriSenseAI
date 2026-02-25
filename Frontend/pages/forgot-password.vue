<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-sans">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100">
      <h2 class="text-2xl font-bold text-green-600 mb-4">Reset Password</h2>
      <p class="text-gray-600 mb-6 text-sm">Enter your email to receive a reset link.</p>
      
      <input 
        v-model="email" 
        type="email" 
        placeholder="example@email.com" 
        @keyup.enter="handleForgotPassword"
        class="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" 
      />
      
      <button 
        @click="handleForgotPassword" 
        class="w-full bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition"
      >
        Send Reset Link
      </button>
      
      <p v-if="message" class="mt-4 text-sm text-center" :class="isError ? 'text-red-500' : 'text-green-600'">
        {{ message }}
      </p>

      <NuxtLink to="/register" class="block text-center mt-4 text-sm text-gray-500 hover:text-green-600">
        Back to Login
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const message = ref('')
const isError = ref(false)

const handleForgotPassword = async () => {
  if (!email.value) {
    message.value = "Please enter your email"
    isError.value = true
    return
  }

  try {
    const response = await $fetch('http://localhost:5000/api/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    message.value = "The reset link has been sent to your email! ✅"
    isError.value = false
  } catch (error) {
    message.value = "Email not found or server error"
    isError.value = true
    console.error(error)
  }
}
</script>
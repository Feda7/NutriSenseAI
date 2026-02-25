<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-sans">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100 text-center">
      <h2 class="text-2xl font-bold text-green-600 mb-6 text-left">New Password</h2>
      
      <div class="relative mb-4 text-left">
        <input 
          v-model="newPassword" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="Enter new password" 
          @keyup.enter="handleResetPassword"
          class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
        />
        <button 
          @click="showPassword = !showPassword" 
          class="absolute right-3 top-2 text-gray-400"
        >
          <span v-if="showPassword">👁️</span>
          
        </button>
      </div>
      
      <button 
        @click="handleResetPassword" 
        class="w-full bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition"
      >
        Update Password
      </button>
       

      <p v-if="message" class="mt-4 text-sm" :class="isError ? 'text-red-500' : 'text-green-600'">
        {{ message }}
      </p>
      <NuxtLink to="/forgot-password" class="block text-center mt-4 text-sm text-gray-500 hover:text-green-600">
        Back 
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const newPassword = ref('')
const showPassword = ref(false)
const message = ref('')
const isError = ref(false)

const handleResetPassword = async () => {
  const token = route.query.token // جلب الرمز من رابط الإيميل
  
  if (!newPassword.value) {
    message.value = "Please enter a new password"
    isError.value = true
    return
  }

  try {
    const response = await $fetch('http://localhost:5000/api/reset-password', {
      method: 'POST',
      body: { 
        token: token, 
        newPassword: newPassword.value 
      }
    })
    
    message.value = "Password updated successfully! ✅"
    isError.value = false
    
    // توجيه المستخدم لصفحة تسجيل الدخول بعد ثانيتين
    setTimeout(() => {
      router.push('/register')
    }, 2000)

  } catch (error) {
    message.value = "Invalid or expired link"
    isError.value = true
  }
}
</script>
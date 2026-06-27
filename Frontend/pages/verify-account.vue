<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center font-sans">
    <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100 text-center">
      <h2 class="text-2xl font-bold text-green-600 mb-6 text-left">Verify Account</h2>
      <p class="text-gray-500 text-sm mb-6 text-left">Enter the 4-digit code sent to your email</p>
      
      <div class="relative mb-4 text-left">
        <input 
          v-model="otpCode" 
          type="text" 
          maxlength="4"
          placeholder="0 0 0 0" 
          class="w-full border rounded-lg px-4 py-2  text-center focus:outline-none focus:ring-2 focus:ring-green-500" 
        />
        
      </div>
       
      
      <button 
        @click="handleVerify" 
        class="w-full bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition "
      >
        Verify Now
      </button>
      
      <div class="text-right mt-1">
        <button @click="resendOTP" class="text-sm text-green-600 hover:underline bg-transparent border-0 cursor-pointer">
          Sent Again
        </button>
      </div>

      <p v-if="message"  class="mt-4 text-sm" :class="isError ? 'text-red-500' : 'text-green-600'">
        {{ message }}
      </p>
  
      <button @click="router.back()" class="block w-full text-center mt-4 text-sm text-gray-500 hover:text-green-600">
        Back
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue' 
import { useRouter } from 'vue-router' 

const otpCode = ref('')
const message = ref('')
const isError = ref(false)
const router = useRouter()

// 1. دالة التحقق من الكود وتفعيل الحساب والتوجيه للبروفايل
const handleVerify = async () => {
  let email = ''
  if (process.client) {
    email = localStorage.getItem('pendingEmail')
  }
  
  if (!email) {
    message.value = "Email reference missing. Please register again."
    isError.value = true
    return
  }
  
  try {
    const res = await $fetch('http://localhost:5000/api/verify-otp', {
      method: 'POST',
      body: { email: email, code: otpCode.value }
    })
    
    message.value = "Account Verified Successfully! 🎉"
    isError.value = false
    
    // التوجيه الفوري لصفحة البروفايل الحقيقية بعد النجاح
    setTimeout(() => router.push('/profile'), 2000)
  } catch (err) {
    message.value = "Invalid or expired code"
    isError.value = true
  }
}

// 2. دالة إعادة إرسال الكود للايميل في حال لم يصل أول مرة
const resendOTP = async () => {
  let email = ''
  if (process.client) {
    email = localStorage.getItem('pendingEmail')
  }

  if (!email) {
    message.value = "Email context missing. Please register again."
    isError.value = true
    return
  }

  try {
    message.value = "Sending a new code to your email..."
    isError.value = false

    // استدعاء المسار المخصص الجديد بدلاً من مسار إنشاء المستخدم القديم
    const res = await $fetch('http://localhost:5000/api/resend-otp', {
      method: 'POST',
      body: { email: email }
    })
    
    if (res.success) {
      message.value = "New code sent successfully! Check your inbox. 📬"
      isError.value = false
    }
  } catch (err) {
    message.value = "Failed to resend code. Please try again."
    isError.value = true
  }
}
</script>
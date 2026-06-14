<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-green-700">NutriSense Admin</h2>
        <p class="text-sm text-gray-500 mt-1">الرجاء تسجيل الدخول لوحة التحكم</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
          <input v-model="email" type="email" required class="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-green-500" placeholder="admin@nutrisense.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
          <input v-model="password" type="password" required class="w-full border p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-green-500" placeholder="••••••••" />
        </div>

        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition duration-250">
          تسجيل الدخول
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>

// هذا السطر السحري الذي يحذف الناف بار والفوتر الافتراضي من هذه الصفحة
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
      // حفظ حالة الدخول في المتصفح
sessionStorage.setItem('adminToken', data.token)
      // التوجيه إلى لوحة التحكم الرئيسية فوراً
router.push('/admin')
    } else {
      alert(data.error)
    }
  } catch (error) {
    alert("حدث خطأ في الاتصال بالسيرفر!")
  }
}
</script>
<template>
  <div class="min-h-screen bg-gray-50 font-sans py-12 px-4">
    <section class="h-auto py-8 my-10 bg-white shadow-md rounded-2xl md:first-line max-w-3xl mx-auto">
      <div class="space-y-4 m-10">
        
        <h2 class="text-2xl font-semibold text-green-600 mb-16">Login to Your Account</h2>

        <!-- Email -->
        <div>
          <label class="block text-gray-700 mb-1">Email</label>
          <input
            v-model="localData.email"
            type="email"
            placeholder="example@email.com"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Password -->
        <div class="relative">
          <label class="block text-gray-700 mb-1">Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="localData.password"
            class="w-full border rounded-lg px-4 py-2 pr-10"
            placeholder="Enter your password"
          />
          
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-9 text-gray-500"
          ></button>
        </div>

        
          <!-- Buttons -->
          <div class="md:flex items-center justify-center md:space-x-6">
            <NuxtLink to="/SectionWelcome">
              <button type="button" class="mt-6 md:mt-14 bg-white text-green-600 px-8 py-2 rounded-xl border border-green-600 font-semibold hover:bg-green-50">
                Back
              </button>
            </NuxtLink>

            <NuxtLink to="/register2">
              <button type="button" class="block mt-6 md:mt-14 bg-white text-green-600 px-8 py-2 rounded-xl border border-green-600 font-semibold hover:bg-green-50">
                Create Account
              </button>
            </NuxtLink>

            <button
              type="button"
              @click="handleLogin"
              class="mt-6 md:mt-14 bg-green-600 text-white px-10 py-2 rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!isFormValid"
            >
              Login
            </button>
          </div>

<p v-if="errorMessage" class="text-red-500 text-center mt-4 font-bold">
  {{ errorMessage }}
</p>
          
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const modelValue = defineModel()
const localData = ref({ 
  email: '', 
  password: '',
  ...modelValue?.value 
})

const showPassword = ref(false)
const errorMessage = ref('') // لإظهار رسائل الخطأ

const isFormValid = computed(() => {
  return localData.value.email && localData.value.password
})

// دالة تسجيل الدخول
const handleLogin = async () => {
  errorMessage.value = ''
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: localData.value.email,
        password: localData.value.password
      })
    })

    const result = await response.json()

    if (response.ok) {
    // خزن الـ userId في localStorage
    localStorage.setItem('userId', result.user.id)

    alert('Logged in successfully!')
    router.push('/food')
}
 else {
      errorMessage.value = 'Email or password is incorrect'
    }
  } catch (error) {
    errorMessage.value = 'Error connecting to the server'
    console.error('Login error:', error)
  }
}
</script>
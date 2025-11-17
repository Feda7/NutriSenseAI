<template>
  <div class="bg-white shadow-md rounded-2xl p-6 mx-auto">
    <h2 class="text-2xl font-semibold text-green-600 mb-4">Settings</h2>

    <form class="space-y-4" @submit.prevent="saveSettings">
      <!-- Birthday -->
      <div>
        <label class="block text-gray-600 mb-1">Birthday</label>
        <input
          v-model="settings.birthdate"
          type="date"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-gray-600 mb-1">Email</label>
        <input
          v-model="settings.email"
          type="email"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Password with show/hide -->
      <div class="relative">
        <label class="block text-gray-600 mb-1">Password</label>
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="settings.password"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 pr-10"
          placeholder="Enter your password"
        />
        <button
          type="button"
          @click="togglePassword"
          class="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
        ></button>
      </div>

      <!-- Daily Calorie Goal -->
      <div>
        <label class="block text-gray-600 mb-1">Daily Calorie Goal</label>
        <input
          v-model="settings.goal"
          type="number"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        />
      </div>

      <!-- Activity Level -->
      <div>
        <label class="block text-gray-600 mb-1">Activity Level</label>
        <select
          v-model="settings.activity"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select activity level</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
        </select>
      </div>

      <!--  Diet -->
      <div>
        <label class="block text-gray-600 mb-1">Diet Type</label>
        <select
          v-model="settings.diet"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Diet Type</option>
          <option value="Bland">Bland Diet</option>
          <option value="High-Protein">High-Protein</option> 
          <option value="High-Fiber">High-Fiber</option> 
          <option value="Low-Saturated Fat">Low-Saturated Fat</option>
          <option value="DASH">DASH</option>
        </select>
      </div>

      <!-- Health Condition (Multi-select) -->
      <div>
        <label class="block text-gray-600 mb-1">Health Condition</label>
        <div class="space-y-2">
          <label class="flex items-center space-x-3">
            <input type="checkbox" value="No Condition" v-model="settings.health" />
            <span>No Condition</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" value="Hypertension" v-model="settings.health" />
            <span>Hypertension</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" value="Diabetes" v-model="settings.health" />
            <span>Diabetes</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" value="Colon" v-model="settings.health" />
            <span>Colon</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" value="Cholesterol" v-model="settings.health" />
            <span>Cholesterol</span>
          </label>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex space-x-4">
        <!-- Save Button -->
        <button
          type="submit"
          :disabled="!isFormValid"
          class="bg-green-600 text-white font-semibold px-6 py-2 rounded-xl 
                 hover:bg-green-700 transition-all
                 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>

        <!-- Logout Button -->
         <NuxtLink :to="isFormValid ? '/register' : ''">
            <button
              type="button"
              @click="logout"
              class="bg-green-600 text-white font-semibold px-6 py-2 rounded-xl 
                    hover:bg-green-700 transition-all"
            >
              Logout
            </button>
         </NuxtLink>

         
           
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['user'])
const emit = defineEmits(['updateUser'])

// Local settings model
const settings = ref({
  birthdate: props.user.birthdate || '',
  email: props.user.email || '',
  password: props.user.password || '',
  goal: props.user.goal || '',
  activity: props.user.activity || '',
  diet: props.user.diet || '',
  health: props.user.health ? [...props.user.health] : []  // متعدد
})

// Password visibility
const showPassword = ref(false)
function togglePassword() {
  showPassword.value = !showPassword.value
}

// 🔥 Check if all fields are filled
const isFormValid = computed(() => {
  return (
    settings.value.birthdate &&
    settings.value.email &&
    settings.value.password &&
    settings.value.goal &&
    settings.value.activity &&
    settings.value.diet &&
    settings.value.health.length > 0
  )
})

// Save changes
function saveSettings() {
  if (!isFormValid.value) return

  emit('updateUser', { ...settings.value })
  alert('✅ Settings saved successfully!')
}

// Logout function
function logout() {
  alert('🔒 Logged out successfully!')
  // هنا ممكن إعادة التوجيه للصفحة الرئيسية أو صفحة تسجيل الدخول
   window.location.href = '/register'
}
</script>
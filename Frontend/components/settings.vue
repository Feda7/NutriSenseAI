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

      <!-- Password -->
      <div class="relative">
        <label class="block text-gray-600 mb-1">Password</label>
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="settings.password"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 pr-10"
          placeholder="Enter new password"
        />
        <button
          type="button"
          @click="togglePassword"
          class="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
        >
        </button>
      </div>

      <!-- Daily Calorie Target -->
      <div>
        <label class="block text-gray-600 mb-1">
          Daily Calorie Target (Calculated)
        </label>
        <input
          v-model="settings.goal"
          type="number"
          disabled
          class="w-full border rounded-lg px-4 py-2 bg-gray-100"
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

      <!-- Preferred Diet -->
      <div>
        <label class="block text-gray-600 mb-1">Preferred Diet</label>
        <input
          v-model="settings.diet"
          type="text"
          disabled
          class="w-full border rounded-lg px-4 py-2 bg-gray-100"
        />
      </div>

      <!-- Health Condition -->
      <div>
        <label class="block text-gray-600 mb-1">Health Condition</label>
        <div class="space-y-2">
          <label class="flex items-center space-x-3">
            <input type="checkbox" :value="1" v-model="settings.health" />
            <span>No Condition</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" :value="2" v-model="settings.health" />
            <span>Hypertension</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" :value="3" v-model="settings.health" />
            <span>Diabetes</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" :value="4" v-model="settings.health" />
            <span>Colon</span>
          </label>
          <label class="flex items-center space-x-3">
            <input type="checkbox" :value="5" v-model="settings.health" />
            <span>Cholesterol</span>
          </label>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex space-x-4">
        <button
          type="submit"
          :disabled="!isFormValid"
          class="bg-green-600 text-white font-semibold px-6 py-2 rounded-xl 
                hover:bg-green-700 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>

        <NuxtLink to="/register">
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
import { ref, computed, watch } from 'vue'

const props = defineProps(['user'])
const emit = defineEmits(['updateUser'])

const settings = ref({
  birthdate: '',
  email: '',
  password: '',
  goal: '',
  activity: '',
  diet: '',
  health: []
})

// ✅ Activity mapping
function mapActivity(id) {
  switch (id) {
    case 1: return 'Low'
    case 2: return 'Moderate'
    case 3: return 'High'
    default: return ''
  }
}

// ✅ Correct watch (يربط بيانات الباكند)
watch(
  () => props.user,
  (newUser) => {
    if (!newUser) return

    settings.value = {
      birthdate: newUser.BirthDate
        ? newUser.BirthDate.split('T')[0]
        : '',

      email: newUser.Email || '',

      password: '',

      goal: newUser.DailyCaloriesTarget || '',

      activity: mapActivity(newUser.ActiveLevelID),

      diet: newUser.DietName || '',

      health: newUser.DiseaseIDs || []

    }
  },
  { immediate: true }
)

// Password toggle
const showPassword = ref(false)
function togglePassword() {
  showPassword.value = !showPassword.value
}

const isFormValid = computed(() => {
  return (
    settings.value.birthdate &&
    settings.value.email &&
    settings.value.goal &&
    settings.value.activity
  )
})

async function saveSettings() {
  const userId = localStorage.getItem('userId')

  try {
    await $fetch(`http://localhost:5000/api/user/${userId}`, {
      method: 'PUT',
      body: {
        FirstName: props.user.FirstName,
        LastName: props.user.LastName,
        BirthDate: settings.value.birthdate,
        Height: props.user.Height,
        CurrentWeight: props.user.CurrentWeight,
        DesiredWeight: props.user.DesiredWeight,
        Gender: props.user.Gender,
        GoalID: props.user.GoalID,
        ActiveLevelID:
          settings.value.activity === 'Low' ? 1 :
          settings.value.activity === 'Moderate' ? 2 : 3,
        Email: settings.value.email,
        Password: settings.value.password || props.user.Password,
        Diseases: settings.value.health
      }
    })

    alert('✅ Settings updated successfully!')
    location.reload()

  } catch (err) {
    console.error(err)
    alert('❌ Failed to update')
  }
}



function logout() {
  alert('🔒 Logged out successfully!')
}
</script>

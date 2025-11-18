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

      <!-- Desired Weight -->
      <div>
        <label class="block text-gray-600 mb-1">Desired Weight</label>
        <input
          v-model="settings.targetWeight"
          type="number"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
          placeholder="Enter your target weight"
        />
      </div>

      <!-- Daily Calorie Goal (Optional) -->
      <div>
        <label class="block text-gray-600 mb-1">Daily Calorie Goal (Optional)</label>
        <input
          v-model="settings.goal"
          type="number"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
          placeholder="Optional"
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

      <!-- Diet (Optional) -->
      <div>
        <label class="block text-gray-600 mb-1">Preferred Diet (Optional)</label>
        <select
          v-model="settings.diet"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Diet Type </option>
          <option value="Bland">Bland Diet</option>
          <option value="High-Protein">High-Protein</option> 
          <option value="High-Fiber">High-Fiber</option> 
          <option value="Low-Saturated Fat">Low-Saturated Fat</option>
          <option value="DASH">DASH</option>
        </select>
      </div>

      <!-- Health Condition (CHECKBOXES) -->
      <div>
        <label class="block text-gray-600 mb-2">Health Conditions</label>

        <div class="space-y-2">

          <!-- No Disease Checkbox -->
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              value="None"
              v-model="settings.health"
              @change="handleNoDisease"
            />
            <span>No Condition</span>
          </label>

          <!-- Other Diseases -->
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              value="Hypertension"
              v-model="settings.health"
              @change="removeNoDisease"
            />
            <span>Hypertension</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              value="Diabetes"
              v-model="settings.health"
              @change="removeNoDisease"
            />
            <span>Diabetes</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              value="Colon"
              v-model="settings.health"
              @change="removeNoDisease"
            />
            <span>Colon</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              value="Cholesterol"
              v-model="settings.health"
              @change="removeNoDisease"
            />
            <span>Cholesterol</span>
          </label>

        </div>
      </div>

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
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['user'])
const emit = defineEmits(['updateUser'])

const settings = ref({
  birthdate: props.user.birthdate || '',
  email: props.user.email || '',
  password: props.user.password || '',
  goal: props.user.goal || '',
  activity: props.user.activity || '',
  diet: props.user.diet || '',
  targetWeight: props.user.targetWeight || '',
  health: Array.isArray(props.user.health) ? props.user.health : []
})

const showPassword = ref(false)
function togglePassword() {
  showPassword.value = !showPassword.value
}

const isFormValid = computed(() => {
  return (
    settings.value.birthdate &&
    settings.value.email &&
    settings.value.password &&
    settings.value.activity &&
    settings.value.targetWeight
  )
})

// When selecting "No Disease", remove all others
function handleNoDisease() {
  if (settings.value.health.includes("None")) {
    settings.value.health = ["None"]
  }
}

// If selecting other diseases, remove "None"
function removeNoDisease() {
  settings.value.health = settings.value.health.filter(h => h !== "None")
}

function saveSettings() {
  if (!isFormValid.value) return

  emit('updateUser', { ...settings.value })
  alert('✅ Settings saved successfully!')
}
</script>

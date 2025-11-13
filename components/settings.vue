<template>
  <div class="bg-white shadow-md rounded-2xl p-6 mx-auto">
    <h2 class="text-2xl font-semibold text-green-600 mb-4">Settings</h2>
    <form class="space-y-4" @submit.prevent="saveSettings">
      <div>
        <label class="block text-gray-600 mb-1">Daily Calorie Goal</label>
        <input
          v-model="settings.goal"
          type="number"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
          placeholder="e.g. 1800"
        />
      </div>

      <div>
        <label class="block text-gray-600 mb-1">Activity Level</label>
        <select
          v-model="settings.activity"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        >
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
        </select>
      </div>

      <div>
        <label class="block text-gray-600 mb-1">Preferred Diet</label>
        <select
          v-model="settings.diet"
          class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        >
          <option>Keto</option>
          <option>Low Carb</option>
          <option>Balanced</option>
          <option>High Protein</option>
        </select>
      </div>

      <button
        type="submit"
        class="bg-green-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-700 transition-all"
      >
        Save Changes
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps(['user'])
const emit = defineEmits(['updateUser'])

const settings = ref({
  goal: '',
  activity: '',
  diet: props.user.diet
})

function saveSettings() {
  emit('updateUser', settings.value)
  alert('✅ Settings saved successfully!')
}
</script>

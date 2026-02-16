<template>
  <div class="min-h-screen bg-gray-100 flex">

    <aside class="w-72 bg-white shadow-md">
      <div class="p-6 border-b">
        <h1 class="text-xl font-bold text-green-600">NutriSense Admin</h1>
        <p class="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>
    </aside>

    <main class="flex-1 p-8">

      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Diets</h2>
          <p class="text-sm text-gray-500">Manage diet plans</p>
        </div>

        <button
          @click="openModal"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Diet
        </button>
      </header>

      <!-- Diet List -->
      <div class="bg-white rounded-2xl shadow p-6">
        <ul class="space-y-3">
          <li
            v-for="(diet, index) in diets"
            :key="diet"
            class="flex justify-between items-center border-b pb-3 last:border-none"
          >
            <span class="font-medium">{{ diet }}</span>

            <button
              @click="removeDiet(index)"
              class="text-red-500 text-xs hover:underline"
            >
              Delete
            </button>
          </li>
        </ul>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 w-96">
          <h3 class="font-semibold mb-4">Add New Diet</h3>

          <input
            v-model="newDiet"
            type="text"
            placeholder="Diet name"
            class="w-full border rounded-lg px-3 py-2 text-sm mb-4"
          />

          <div class="flex justify-end space-x-2">
            <button
              @click="showModal = false"
              class="px-4 py-2 text-sm border rounded-lg"
            >
              Cancel
            </button>

            <button
              @click="addDiet"
              class="px-4 py-2 text-sm bg-green-500 text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const diets = ref(['Bland','High-Protein','High-Fiber','Low-Saturated Fat','DASH'])
const showModal = ref(false)
const newDiet = ref('')

function openModal() {
  showModal.value = true
}

function addDiet() {
  if (newDiet.value.trim()) {
    diets.value.push(newDiet.value)
    newDiet.value = ''
    showModal.value = false
  }
}

function removeDiet(index) {
  diets.value.splice(index, 1)
}
</script>

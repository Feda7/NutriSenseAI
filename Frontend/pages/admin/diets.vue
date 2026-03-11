<template>
  <div class="min-h-screen bg-gray-100 flex">
    
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

definePageMeta({
  layout: "admin"
})

import { ref, onMounted } from "vue"

const diets = ref([])
const showModal = ref(false)
const newDiet = ref("")

const API = "http://localhost:5000/api/diets"


function openModal() {
  showModal.value = true
}


/* ======================
   تحميل الدايت من السيرفر
====================== */

async function fetchDiets() {
  try {

    const res = await fetch(API)

    if (!res.ok) {
      throw new Error("API error")
    }

    const data = await res.json()

    diets.value = data

  } catch (error) {
    console.error("Failed to load diets:", error)
  }
}


onMounted(() => {
  fetchDiets()
})



/* ======================
   إضافة دايت
====================== */

async function addDiet() {

  if (!newDiet.value.trim()) return

  try {

    await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: newDiet.value
      })
    })

    newDiet.value = ""
    showModal.value = false

    fetchDiets()

  } catch (error) {
    console.error("Add diet error:", error)
  }

}



/* ======================
   حذف دايت
====================== */

async function removeDiet(id) {

  try {

    await fetch(`${API}/${id}`, {
      method: "DELETE"
    })

    diets.value = diets.value.filter(
      diet => diet.DietTypeID !== id
    )

  } catch (error) {
    console.error("Delete error:", error)
  }

}

</script>

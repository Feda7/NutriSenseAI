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

      <div class="bg-white rounded-2xl shadow p-6">
        <ul class="space-y-3">
          <li
            v-for="diet in diets"
            :key="diet.DietTypeID"
            class="flex justify-between items-center border-b pb-3 last:border-none"
          >
<span class="font-medium text-gray-700">{{ diet.Name }}</span>
            <button
              @click="removeDiet(diet.DietTypeID)"
              class="text-red-500 text-xs hover:underline"
            >
              Delete
            </button>
          </li>
        </ul>
        
        <p v-if="diets.length === 0" class="text-gray-400 text-center py-4">No diets found in database.</p>
      </div>

      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div class="bg-white rounded-xl p-6 w-96">
          <h3 class="font-semibold mb-4 text-gray-800">Add New Diet</h3>

          <input
            v-model="newDiet"
            type="text"
            placeholder="Diet name"
            class="w-full border rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-green-500"
          />

          <div class="flex justify-end space-x-2">
            <button
              @click="showModal = false"
              class="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              @click="addDiet"
              class="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
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

// رابط الـ API الموجه لسيرفرك الحالي
const API = "http://localhost:5000/api/diets" 

function openModal() {
  showModal.value = true
}

/* 1. دالة جلب البيانات عند فتح الصفحة */
async function fetchDiets() {
  try {
    const res = await fetch(API)
    if (!res.ok) throw new Error("API error")
    const data = await res.json()
    diets.value = data // تخزين المصفوفة القادمة من قاعدة البيانات
  } catch (error) {
    console.error("Failed to load diets:", error)
  }
}

// تشغيل جلب البيانات فوراً عند تحميل الصفحة
onMounted(() => {
  fetchDiets()
})

async function addDiet() {
  if (!newDiet.value.trim()) return;

  try {
    console.log("Sending data to backend:", newDiet.value); // للتأكد من خروج البيانات من المتصفح
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDiet.value })
    });

    if (res.ok) {
      newDiet.value = ""; 
      showModal.value = false; 
      fetchDiets(); 
    } else {
      const errorData = await res.json();
      alert("Backend Error: " + errorData.error);
    }
  } catch (error) {
    console.error("Add diet error:", error);
    alert("Could not connect to the backend server. Make sure node index.js is running!");
  }
}
/* 3. دالة حذف دايت معين */
async function removeDiet(id) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE"
    })

    if (res.ok) {
      // تحديث الواجهة وحذف العنصر من الشاشة مباشرة دون إعادة التحميل
      diets.value = diets.value.filter(diet => diet.DietTypeID !== id)
    }
  } catch (error) {
    console.error("Delete error:", error)
  }
}
</script>
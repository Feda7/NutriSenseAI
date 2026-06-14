<template>
  <div class="min-h-screen bg-gray-100 flex">
    <main class="flex-1 p-8">
      
      <header class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Admin Tools & Maintenance</h2>
        <p class="text-sm text-gray-500">Quick operations and system configuration utilities</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-2">✨ Add Global Health Condition</h3>
          <p class="text-xs text-gray-400 mb-4">Inject a new disease/condition directly into the system database for users.</p>
          
          <form @submit.prevent="addDisease" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Condition Name</label>
              <input 
                v-model="newDiseaseName" 
                type="text" 
                placeholder="e.g., Celiac Disease, Hypertension" 
                class="w-full border p-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition">
              Add to Database
            </button>
          </form>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">⚙️ System Maintenance</h3>
            <p class="text-xs text-gray-400 mb-4">Perform heavy clean-up actions on backend operational logs and temporary records.</p>
            
            <div class="bg-red-50 border border-red-100 p-3 rounded-xl mb-4">
              <p class="text-xs text-red-700 font-medium">⚠️ Danger Zone Actions</p>
              <p class="text-[11px] text-red-500 mt-0.5">Clearing meal records will completely wipe all users' logged food history. This action cannot be undone.</p>
            </div>
          </div>

          <button @click="clearMealsLog" class="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-bold transition">
            Wipe All User Meals Logs
          </button>
        </div>

      </div>

    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin"
})

import { ref } from "vue"

const newDiseaseName = ref("")
const BASE_API = "http://localhost:5000/api/admin/tools"

// دالة إرسال حالة صحية جديدة لجدول diseases
async function addDisease() {
  try {
    const res = await fetch(`${BASE_API}/diseases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diseaseName: newDiseaseName.value })
    })
    
    const data = await res.json()
    if (res.ok) {
      alert(data.message || "Condition added successfully!")
      newDiseaseName.value = "" // تصفير الحقل بعد الإدخال بنجاح
    } else {
      alert("Error: " + data.error)
    }
  } catch (error) {
    console.error("Failed to add disease:", error)
    alert("Backend connection failed.")
  }
}

// دالة تصفير سجلات الوجبات بالكامل
async function clearMealsLog() {
  if (!confirm("CRITICAL WARNING:\nAre you absolutely sure you want to delete EVERY single user meal log in the system? This will reset the statistics to 0.")) return
  if (!confirm("Final Confirmation: Proceed with database purge?")) return

  try {
    const res = await fetch(`${BASE_API}/clear-meals`, {
      method: "DELETE"
    })
    const data = await res.json()
    if (res.ok) {
      alert(data.message)
    } else {
      alert("Error: " + data.error)
    }
  } catch (error) {
    console.error("Purge action failed:", error)
    alert("Backend connection failed.")
  }
}
</script>
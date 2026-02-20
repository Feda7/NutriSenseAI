<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
   

    <div class="flex flex-1">
     

      <!-- Main Panel -->
      <main class="flex-1 p-8">
        <h2 class="text-2xl font-bold mb-6">Quick admin actions</h2>
        <div class="bg-white p-6 rounded-2xl shadow flex gap-4">
          <button class="px-4 py-2 bg-green-500 text-white rounded-md text-sm">Add Meal</button>
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md text-sm">Add Diet</button>
          <button class="px-4 py-2 bg-black text-white rounded-md text-sm">Export</button>
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: "admin"
})
</script>


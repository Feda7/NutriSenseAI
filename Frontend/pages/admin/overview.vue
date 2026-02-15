<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Overview</h2>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white p-6 rounded-xl shadow">
        Total Users: {{ users.length }}
      </div>

      <div class="bg-white p-6 rounded-xl shadow">
        Total Meals: {{ meals.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const users = ref([])
const meals = ref([])
</script>

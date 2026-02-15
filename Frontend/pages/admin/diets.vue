<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Diets</h2>

    <div class="grid grid-cols-2 gap-4">
      <div v-for="d in diets" :key="d.name" class="bg-white p-4 rounded-xl shadow">
        <div class="font-medium">{{ d.name }}</div>
        <div class="text-sm text-gray-500">{{ d.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const diets = ref([])
</script>

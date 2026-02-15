<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Meals</h2>

    <div class="grid grid-cols-3 gap-4">
      <div v-for="m in meals" :key="m.name" class="bg-white p-4 rounded-xl shadow">
        <img :src="m.image" class="w-full h-32 object-cover rounded mb-2" />
        <div class="font-medium">{{ m.name }}</div>
        <div class="text-xs text-gray-500">{{ m.calories }} kcal</div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const meals = ref([
  { name: 'Meal 1', calories: 200, image: '/images/test.jpg' }
])
</script>

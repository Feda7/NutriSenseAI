<template>
  <div class="min-h-screen bg-gray-50 px-6 py-10">
    <h1 class="text-3xl font-bold text-green-600 mb-8 text-center">
      Welcome back, {{ user.name }}
    </h1>

    <!-- Profile Section -->
    <ProfileSection :user="user" @updateUser="updateUser" />

    <!-- Space between sections -->
    <div class="my-10"></div>

    <!-- Settings Section -->
    <Settings :user="user" @updateUser="updateUser" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user = ref({
  name: 'Fidaa Bin Fadhel',
  age: 23,
  height: 156,
  weight: 45,
  diet: 'Low Carb 🍳',
  goal: 'Maintain Weight',
  about: 'I’m passionate about living a balanced lifestyle and staying active.',
  reason: 'To feel more energetic and confident every day.',
  inspiration: 'Seeing my progress motivates me to keep improving!',
  photo: '#'
})

function updateUser(updated) {
  user.value = { ...user.value, ...updated }
}
</script>

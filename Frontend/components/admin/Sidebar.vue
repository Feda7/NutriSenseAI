<template>
  <aside class="w-72 bg-white shadow-md">
    <div class="p-6 border-b">
      <h1 class="text-xl font-bold text-green-600">NutriSense Admin</h1>
      <p class="text-sm text-gray-500 mt-1">Dashboard</p>
    </div>

    <nav class="p-4">
      <ul class="space-y-1">
        <li v-for="item in menu" :key="item.key">
          <NuxtLink
            :to="`/admin/${item.key}`"
            class="w-full block px-4 py-3 rounded-lg flex items-center gap-3 text-gray-700 hover:bg-gray-50"
          >
            <span class="w-6 text-center">{{ item.icon }}</span>
            <span class="font-medium">{{ item.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
const menu = [
  { key: 'overview', title: 'Overview', icon: '🏠' },
  { key: 'users', title: 'Users', icon: '👥' },
  { key: 'diets', title: 'Diets', icon: '🥗' },
  { key: 'meals', title: 'Meals', icon: '🍽️' },
  { key: 'reports', title: 'Reports', icon: '📄' },
  { key: 'tools', title: 'Admin Tools', icon: '🛠️' }
]
</script>

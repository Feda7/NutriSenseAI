<template>
  <div class="min-h-screen bg-gray-100 flex">

    <!-- SIDEBAR -->
    <aside class="w-72 bg-white shadow-md">
      <div class="p-6 border-b">
        <h1 class="text-xl font-bold text-green-600">NutriSense Admin</h1>
        <p class="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>

      <nav class="p-4">
        <ul class="space-y-1">
          <li v-for="item in menu" :key="item.title">
            <NuxtLink
              :to="item.path"
              class="block px-4 py-3 rounded-lg hover:bg-green-50"
            >
              {{ item.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8">

      <!-- HEADER -->
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <p class="text-sm text-gray-500">Manage system data</p>
        </div>
      </header>

      <!-- هنا يظهر محتوى الصفحة -->
      <slot />

    </main>
  </div>
</template>

<script setup>
const menu = [
  { title: 'Overview', path: '/admin' },
  { title: 'Users', path: '/admin/users' },
  { title: 'Diets', path: '/admin/diets' },
  { title: 'Meals', path: '/admin/meals' },
  { title: 'Reports', path: '/admin/reports' },
  { title: 'Tools', path: '/admin/tools' }
]
</script>
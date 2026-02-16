<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
      <nav class="flex gap-6">
        <a href="#" class="hover:underline">Home</a>
        <a href="#" class="hover:underline">Food</a>
        <a href="#" class="hover:underline">Progress</a>
      </nav>
      <button class="bg-white text-green-600 px-4 py-2 rounded">Profile</button>
    </header>

    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside class="w-72 bg-white shadow-md p-6 flex flex-col">
        <h1 class="text-xl font-bold text-green-600 mb-6">NutriSense Admin</h1>
        <nav class="flex flex-col gap-2">
          <a href="#" class="hover:bg-gray-200 p-2 rounded">Overview</a>
          <a href="#" class="hover:bg-gray-200 p-2 rounded">Users</a>
          <a href="#" class="hover:bg-gray-200 p-2 rounded">Diets</a>
          <a href="#" class="hover:bg-gray-200 p-2 rounded">Meals</a>
          <a href="#" class="hover:bg-gray-200 p-2 rounded">Reports</a>
          <a href="#" class="hover:bg-gray-200 p-2 rounded">Admin Tools</a>
        </nav>
        <div class="mt-auto space-y-2">
          <button class="px-4 py-2 bg-green-500 text-white rounded-md text-sm">Export CSV</button>
          <button class="px-4 py-2 bg-red-500 text-white rounded-md text-sm">Reset Data</button>
        </div>
      </aside>

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
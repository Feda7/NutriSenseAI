<template>
    <div>
        <header>
            <title>NutriSenseAI</title>
            <nav class="flex justify-between items-center px-8 py-4 bg-white shadow-md z-50">
                <!-- Logo -->
                <div class="text-2xl font-bold text-green-600">
                NutriSense AI
                </div>

                <!-- Links -->
                <ul class="flex gap-8 text-gray-700 font-medium">
                    <li><NuxtLink to="/">Home</NuxtLink></li>
                    <li><NuxtLink to="/food">Food</NuxtLink></li>
                    <li><NuxtLink to="/progress">Progress</NuxtLink></li>
                </ul>

                <!-- Profile -->
                <div class="flex items-center gap-3">
                <img src="#" alt="Profile" class="w-8 h-8 rounded-full border" />
                <NuxtLink to="/profile" class="text-gray-700 hover:text-green-600">Profile</NuxtLink>
                </div>
            </nav>
        </header>
    </div>
    <div>
        <slot />
    </div>
    <div>
        <footer class="bg-gray-100 py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col items-center text-gray-700">
      
      <p class="mb-4 text-center">&copy; 2025 NutriSenseAI. All rights reserved.</p>
      
      
      <div class="flex gap-6">
        
        <NuxtLink class="hover:text-green-600 transition-all" to="/">Contact</NuxtLink>
      </div>
    </div>
  </footer>
    </div>
</template>

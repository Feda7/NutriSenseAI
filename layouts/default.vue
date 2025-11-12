<template>
    <div>
        <header>
            <nav class="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-50">
                <!-- Logo -->
                <div class="text-2xl font-bold text-green-600">
                NutriSense AI
                </div>

                <!-- Links -->
                <ul class="flex gap-8 text-gray-700 font-medium">
                <li><NuxtLink to="/">index</NuxtLink></li>
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
</template>

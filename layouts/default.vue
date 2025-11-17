<template>
    <div>
        <header>
            <title>NutriSenseAI</title>
            <nav class="flex justify-between items-center px-8 py-4 bg-green-500 shadow-md z-50">
                <!-- Logo -->
                <div class="text-2xl font-bold text-white">
                NutriSense AI
                </div>

                <!-- Links -->
                <ul class="flex gap-8 text-white font-medium ">
                    <li class="hover:text-lg hover:text-gray-600">
                        <a href="#" @click.prevent="handleNav('/')">Home</a>
                    </li>
                    <li class="hover:text-lg hover:text-gray-600">
                        <a href="#" @click.prevent="handleNav('/food')">Food</a>
                    </li>
                    <li class="hover:text-lg hover:text-gray-600">
                        <a href="#" @click.prevent="handleNav('/progress')">Progress</a>
                    </li>
                    </ul>

                <!-- Profile -->
                <div class="flex items-center gap-3">
                    <img src="#" alt="Profile" class="w-8 h-8 rounded-full border" />
                    <a href="#" @click.prevent="handleNav('/profile')" class="text-white hover:text-gray-600 font-medium">
                        Profile
                    </a>
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
                <div class="flex gap-6">
                    <a class="hover:text-green-600 transition-all" href="#" @click.prevent="handleNav('/')">Contact</a>
                </div>
                <p class="mb-4 text-center">&copy; 2025 NutriSenseAI. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const auth = useAuth()

const handleNav = (path) => {
    if (!auth.state.isLoggedIn) {
        router.push('/register') // لو ما مسجل، حوله للتسجيل
    } else {
        router.push(path) // لو مسجل، يروح للرابط المطلوب
    }
}
</script>
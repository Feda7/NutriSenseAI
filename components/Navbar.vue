<template>
    <div>
        <header>
            <title>NutriSenseAI</title>
            <nav class="flex justify-between items-center px-8 py-4 bg-green-500 shadow-md z-50">
                
                <!-- Logo -->
                <div class="text-2xl font-bold text-white">
                NutriSense AI
                </div>

                <button 
                    @click="isOpen = !isOpen" 
                    class="md:hidden text-3xl text-green-600 absolute right-6"
                >
                    ☰
                </button>
                <!-- Links -->
                <ul class="hidden md:flex md:gap-8 text-white font-medium ">
                <li></li>
                    <li class="hover:text-lg hover:text-gray-600">
                        <NuxtLink to="/">Home</NuxtLink>
                        <!-- <a href="#" @click.prevent="handleNav('/')">Home</a> -->
                    </li>
                    <li class="hover:text-lg hover:text-gray-600">
                        <NuxtLink to="/food">Food</NuxtLink>
                        <!-- <a href="#" @click.prevent="handleNav('/food')">Food</a> --> 
                    </li>
                    <li class="hover:text-lg hover:text-gray-600">
                        <NuxtLink to="/progress">Progress</NuxtLink>
                        <!-- <a href="#" @click.prevent="handleNav('/progress')">Progress</a>-->
                    </li>
                </ul>
                <!-- Profile -->
                <div class="hidden md:flex items-center gap-3">
                    <img src="#" alt="Profile" class="w-8 h-8 rounded-full border" />
                    <NuxtLink to="/profile" class="text-white hover:text-gray-600 font-medium">Profile</NuxtLink>
                <!--<a href="#" @click.prevent="handleNav('/profile')" class="text-white hover:text-gray-600 font-medium">
                        Profile
                    </a>-->
                </div>
            </nav>
            <transition name="NutriSense">
                <ul 
                    v-if="isOpen"
                    class="md:hidden absolute right-4 top-20 bg-white w-44 py-4 rounded-xl shadow-lg border z-40 text-gray-700 font-medium space-y-3"
                    >
                    <li class="px-4 hover:text-green-600">
                        <NuxtLink @click="closeMenu" to="/">Home</NuxtLink>
                    </li>

                    <li class="px-4 hover:text-green-600">
                        <NuxtLink @click="closeMenu" to="/food">Food</NuxtLink>
                    </li>

                    <li class="px-4 hover:text-green-600">
                        <NuxtLink @click="closeMenu" to="/progress">Progress</NuxtLink>
                    </li>

                    <li class="px-4 hover:text-green-600">
                        <NuxtLink @click="closeMenu" to="/profile">Profile</NuxtLink>
                    </li>
                </ul>
            </transition>
        </header>
    </div>
</template>
<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

function closeMenu() {
  isOpen.value = false
}
// import { useRouter } from 'vue-router'
// import { useAuth } from '~/composables/useAuth'

// const router = useRouter()
// const auth = useAuth()

// const handleNav = (path) => {
//     if (!auth.state.isLoggedIn) {
//         router.push('/register') // لو ما مسجل، حوله للتسجيل
//     } else {
//         router.push(path) // لو مسجل، يروح للرابط المطلوب
//     }
// }
</script>
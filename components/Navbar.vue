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
                <div class="flex items-center gap-3">
                    <img src="#" alt="Profile" class="w-8 h-8 rounded-full border" />
                    <NuxtLink to="/profile" class="text-white hover:text-gray-600 font-medium">Profile</NuxtLink>
                <!--<a href="#" @click.prevent="handleNav('/profile')" class="text-white hover:text-gray-600 font-medium">
                        Profile
                    </a>-->
                </div>
            </nav>
        </header>
    </div>
</template>
<script setup>
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
<template>
    <div>
        <footer class="bg-gray-100 py-10">
            <div class="max-w-7xl mx-auto px-6 flex flex-col items-center text-gray-700">
                <div class="flex gap-6">
                    <NuxtLink class="hover:text-green-600 transition-all" to="/">Contact</NuxtLink>
                    <!-- <a class="hover:text-green-600 transition-all" href="#" @click.prevent="handleNav('/')">Contact</a>-->
                </div>
                <p class="mb-4 text-center">&copy; 2025 NutriSenseAI. All rights reserved.</p>
            </div>
        </footer>
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
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
                        <NuxtLink to="/home">Home</NuxtLink>
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
                    <img 
                        :src="userPhoto" 
                        alt="Profile" 
                        class="profile-img-fix border-2 border-white shadow-sm"
                    />
                    <NuxtLink to="/profile" class="text-white hover:text-gray-600 font-medium">Profile</NuxtLink>
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
import { ref, onMounted } from 'vue'

const isOpen = ref(false)
const userPhoto = ref('#') // متغير جديد لتخزين رابط الصورة

function closeMenu() {
  isOpen.value = false
}

// الكود الذي يقرأ الصورة عند فتح أي صفحة
onMounted(() => {
  // أولاً: نجلب الآيدي حق المستخدم اللي مسجل دخول دحين
  const userId = localStorage.getItem('userId')
  
  if (userId) {
    // ثانياً: نبحث عن الصورة اللي تنتهي برقم هذا المستخدم بس
    const savedPhoto = localStorage.getItem(`userPhoto_${userId}`)
    
    if (savedPhoto) {
      userPhoto.value = savedPhoto
    } else {
      userPhoto.value = '#' // لو ماله صورة تطلع فاضية
    }
  } else {
    userPhoto.value = '#' // لو مافي مستخدم أصلاً
  }
})

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

<style scoped>
/* هذا الكود يضمن أن الصورة لن تتجاوز هذا الحجم أبداً مهما حدث */
.profile-img-fix {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    max-width: 40px !important;
    min-height: 40px !important;
    max-height: 40px !important;
    object-fit: cover !important;
    border-radius: 9999px !important; /* لجعلها دائرية دائماً */
    display: block !important;
}
</style>
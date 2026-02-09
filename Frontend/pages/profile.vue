<template>
  <div class="min-h-screen bg-gray-50 px-6 py-10">
    <h1 v-if="user" class="text-3xl font-bold text-green-600 mb-8 text-center">
      Welcome back, {{ user.FirstName }}
    </h1>

    <!-- Profile Section -->
    <ProfileSection v-if="user" :user="user" @updateUser="updateUser" />

    <!-- Space between sections -->
    <div class="my-10"></div>

    <!-- Settings Section -->
    <Settings v-if="user" :user="user" @updateUser="updateUser" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)

// تحميل بيانات المستخدم من DB
onMounted(async () => {
  const userId = localStorage.getItem('userId')

  if (!userId) {
    navigateTo('/register')
    return
  }

  try {
    const dbUser = await $fetch(
      `http://localhost:3001/api/user/${userId}`
    )
    user.value = {
      name: `${dbUser.FirstName} ${dbUser.LastName}`,
      age: calculateAge(dbUser.BirthDate),
      height: dbUser.Height,
      weight: dbUser.CurrentWeight,
      email: dbUser.Email,
      photo: '#',
      about: '',
      reason: '',
      inspiration: '',
      birthdate: dbUser.BirthDate,
      goal: '',
      activity: '',
      diet: '',
      health: []
    }
  } 
  catch (err) {
    console.error('❌ Failed to load user:', err)
    navigateTo('/register')
  }
})
function calculateAge(birthDate) {
  const birth = new Date(birthDate)
  const diff = Date.now() - birth.getTime()
  return new Date(diff).getUTCFullYear() - 1970
}

// تحديث البيانات محليًا (بعد تعديل البروفايل أو الإعدادات)
function updateUser(updated) {
  user.value = { ...user.value, ...updated }
}
</script>


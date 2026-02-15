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
      `http://localhost:5000/api/user/${userId}`
    )
     // سطر جديد: جلب الصورة من الذاكرة إذا كانت موجودة
    const savedPhoto = localStorage.getItem('userPhoto')

    // في ملف profile.vue - امسحي القوس القديم وضعي هذا مكانه بالضبط
user.value = {
  ...dbUser,
  // هذا السطر سيسحب الصورة من الذاكرة بدلاً من القيمة الفارغة
  photo: savedPhoto || '#', 
  
  name: `${dbUser.FirstName} ${dbUser.LastName}`,
  age: calculateAge(dbUser.BirthDate),
  height: dbUser.Height,
  weight: dbUser.CurrentWeight,
  email: dbUser.Email,
  about: '',
  reason: '',
  inspiration: '',
  birthdate: dbUser.BirthDate,
  goal: mapGoal(dbUser.GoalID),
  activity:  mapActivity(dbUser.ActiveLevelID),
  diet: dbUser.DietName || '',
  health: dbUser.MedicalConditions
    ? dbUser.MedicalConditions.split(',')
    : []
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
function mapGoal(id) {
  const map = {
    1: 'Weight Loss',
    2: 'Weight Gain',
    3: 'Maintain Weight'
  }
  return map[id] || ''
}
function mapActivity(id) {
  const map = {
    1: 'Low',
    2: 'Moderate',
    3: 'High'
  }
  return map[id] || ''
}
// تحديث البيانات محليًا (بعد تعديل البروفايل أو الإعدادات)
function updateUser(updated) {
  user.value = { ...user.value, ...updated }
}
</script>


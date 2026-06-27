<template>
  <div class="min-h-screen bg-gray-50 px-6 py-10">
    <h1 v-if="user" class="text-3xl font-bold text-green-600 mb-8 text-center">
      Welcome back, {{ user.FirstName }}
    </h1>

    <!-- 1. Profile Section -->
    <ProfileSection v-if="user" :user="user" @updateUser="updateUser" />

    <!-- Space between sections -->
    <div class="my-10"></div>

    <!-- 2. 📋 System Support & Feedback Box (تم تحسين العرض والمحاذاة لليسار) -->
    <div v-if="user" class="w-full bg-white rounded-2xl shadow p-6 border border-gray-100 text-left">
      <h3 class="text-xl font-bold text-gray-800 mb-1">Contact System Admin / Submit a Report</h3>
      <p class="text-sm text-gray-500 mb-4">Experiencing bugs, application errors, or calorie miscalculations? Drop us a line and our admin team will review it.</p>
      
      <form @submit.prevent="sendReport">
        <div class="mb-4">
          <textarea
            v-model="reportMessage"
            rows="4"
            class="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-left"
            placeholder="Describe your issue or feedback here..."
            required
          ></textarea>
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            :disabled="isSending"
            class="bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2.5 px-6 rounded-xl transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ isSending ? 'Sending...' : 'Submit Report' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Space between sections -->
    <div class="my-10"></div>

    <!-- 3. Settings Section -->
    <Settings v-if="user" :user="user" @updateUser="updateUser" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)
const reportMessage = ref("")
const isSending = ref(false)

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
    
    // التعديل: قراءة الصورة الخاصة بهذا المستخدم فقط
    const savedPhoto = localStorage.getItem(`userPhoto_${userId}`)

    user.value = {
      ...dbUser,
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
      health: dbUser.MedicalConditions || []
    }
  } 
  catch (err) {
    console.error('❌ Failed to load user:', err)
    navigateTo('/register')
  }
})

// دالة إرسال الرسالة إلى السيرفر لقاعدة البيانات
async function sendReport() {
  if (!reportMessage.value.trim()) return

  const storedId = localStorage.getItem('userId')
  if (!storedId) {
    alert('User ID not found, please log in again.')
    return
  }

  isSending.value = true
  try {
    const response = await $fetch('http://localhost:5000/api/users/reports', {
      method: 'POST',
      body: {
        UserID: Number(storedId), // تحويل القيمة لرقم بشكل صريح لتفادي مشكلة الـ constraint
        message: reportMessage.value
      }
    })

    if (response && response.success) {
      alert('Your message has been submitted to the admin! 👍')
      reportMessage.value = "" // تنظيف الحقل بعد النجاح
    } else {
      alert('Failed to send the report.')
    }
  } catch (err) {
    console.error('❌ Error details:', err)
    alert('An error occurred while sending. Please try again later.')
  } finally {
    isSending.value = false
  }
}

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
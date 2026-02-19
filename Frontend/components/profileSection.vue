<template>
  <div class="bg-white shadow-md rounded-2xl p-6 mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-green-600">Profile</h2>
      <button
        type="button"
        @click="toggleEdit"
        :disabled="editing && !isFormValid"
        class="text-green-600 font-medium transition hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {{ editing ? 'Save ' : 'Edit Profile ' }}
      </button>
    </div>

    <div class="flex items-center gap-4 mb-6 ml-8 md:ml-0">
        <img
          :src="localUser.photo"
          alt="Profile photo"
          class="w-56 h-56 rounded-full border-4 border-green-100 object-cover shadow-lg"
        />  
      <div>
        <input
          type="file"
          id="photoInput"
          class="hidden"
          @change="handlePhoto"
        />
        <button
          v-if="editing"
          type="button"
          @click="choosePhoto"
          class="bg-gray-100 text-sm text-gray-600 px-3 py-1 rounded-lg border border-green-600 font-semibold hover:bg-green-50"
        >
          Change Photo
        </button>
      </div>
    </div>

    <div class="space-y-3 text-gray-700 mb-6">
      <div>
        <label class="font-medium text-gray-800">Name:</label>
        <input
          v-model="localUser.name"
          :readonly="!editing"
          class="border rounded-lg px-3 py-1 w-full"
        />
      </div>

      <div>
        <label class="font-medium text-gray-800">Age:</label>
        <input
          v-model="localUser.age"
          type="number"
          :readonly="!editing"
          class="border rounded-lg px-3 py-1 w-full"
        />
      </div>

      <div>
        <label class="font-medium text-gray-800">Height (cm):</label>
        <input
          v-model="localUser.height"
          type="number"
          :readonly="!editing"
          class="border rounded-lg px-3 py-1 w-full"
        />
      </div>

      <div>
        <label class="font-medium text-gray-800">Weight (kg):</label>
        <input
          v-model="localUser.weight"
          type="number"
          :readonly="!editing"
          class="border rounded-lg px-3 py-1 w-full"
        />
      </div>
    </div>

    
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps(['user'])
const emit = defineEmits(['updateUser'])

const localUser = ref({})
const editing = ref(false)

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      localUser.value = { ...newUser }
    }
  },
  { immediate: true }
)
const isFormValid = computed(() => {
  const u = localUser.value
  return (
    u.photo &&
    u.name &&
    u.age &&
    u.height &&
    u.weight 
  )
})

async function toggleEdit() {
  if (editing.value) {
    if (!isFormValid.value) {
      alert('⚠ Please fill all fields before saving.')
      return
    }

    const userId = localStorage.getItem('userId')

    // نفصل الاسم الأول والأخير
    const nameParts = localUser.value.name.split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // نحول العمر إلى تاريخ ميلاد تقريبي
    const currentYear = new Date().getFullYear()
    const birthYear = currentYear - localUser.value.age
    const birthDate = `${birthYear}-01-01`

    try {
      await $fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'PUT',
        body: {
          FirstName: firstName,
          LastName: lastName,
          BirthDate: birthDate,
          Height: localUser.value.height,
          CurrentWeight: localUser.value.weight,
          DesiredWeight: props.user.DesiredWeight,
          Gender: props.user.Gender,
          GoalID: props.user.GoalID,
          ActiveLevelID: props.user.ActiveLevelID,
          Email: props.user.Email,
          Password: props.user.Password,
          Diseases: props.user.DiseaseIDs || []
        }
      })

      alert('✅ Profile updated successfully!')
      location.reload()

    } catch (err) {
      console.error(err)
      alert('❌ Failed to update')
      return
    }
  }

  editing.value = !editing.value
}


function choosePhoto() {
  document.getElementById('photoInput').click()
}

function handlePhoto(e) {
  const file = e.target.files[0]
  if (!file) return
  
  // 1. نجلب الآيدي حق المستخدم الحالي
  const userId = localStorage.getItem('userId')
  
  const reader = new FileReader()
  reader.onload = (evt) => {
    const base64Image = evt.target.result
    
    // 2. نحدث الصورة في الصفحة أمامك
    localUser.value.photo = base64Image

    // 3. التعديل الجوهري: الحفظ باسم "خاص" بهذا المستخدم فقط
    if (userId) {
      localStorage.setItem(`userPhoto_${userId}`, base64Image)
    } else {
      // احتياطياً لو الآيدي مفقود نحفظه بشكل عام لكن الأفضل بالآيدي
      localStorage.setItem('userPhoto', base64Image) 
    }
  }
  reader.readAsDataURL(file)
}
</script>
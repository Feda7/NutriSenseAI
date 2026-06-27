<template>
  <div class="min-h-screen bg-gray-50 font-sans py-12 px-4">
    <section class="h-auto py-8 my-10 bg-white shadow-md rounded-2xl max-w-3xl mx-auto">
      <div class="space-y-4 m-10">

        <h2 class="text-2xl font-semibold text-green-600 mb-16">Create Your Account Details</h2>

        <!-- First Name -->
        <div>
          <label class="block text-gray-700 mb-1">First Name</label>
          <input
            v-model="localData.firstName"
            type="text"
            placeholder="Enter your first name"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Last Name -->
        <div>
          <label class="block text-gray-700 mb-1">Last Name</label>
          <input
            v-model="localData.lastName"
            type="text"
            placeholder="Enter your last name"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Birth Date -->
        <div>
          <label class="block text-gray-700 mb-1">Birth Date</label>
          <input
            v-model="localData.birthDate"
            type="date"
            :max="todayDate"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Age (Auto) -->
        <div>
          <label class="block text-gray-700 mb-1">Age</label>
          <input
            v-model="localData.age"
            type="number"
            disabled
            class="w-full border rounded-lg px-4 py-2 bg-gray-100"
          />
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-gray-700 mb-1">Gender</label>
          <select
            v-model="localData.gender"
            class="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <!-- Current Weight -->
        <div>
          <label class="block text-gray-700 mb-1">Current Weight (kg)</label>
          <input
            v-model="localData.currentWeight"
            type="number"
            min="25"
            placeholder="Enter your current weight"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Desired Weight -->
        <div>
          <label class="block text-gray-700 mb-1">Desired Weight (kg)</label>
          <input
            v-model="localData.targetWeight"
            type="number"
            min="25]"
            placeholder="Enter your target weight"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Height -->
        <div>
          <label class="block text-gray-700 mb-1">Height (cm)</label>
          <input
            v-model="localData.height"
            min="50"
            type="number"
            placeholder="Enter your height in cm"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Activity Level -->
        <div>
          <label class="block text-gray-700 mb-1">Activity Level</label>
          <select
            v-model="localData.activity"
            class="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Activity Level</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>

        <!-- Medical Conditions -->
<div>
  <label class="block text-gray-700 mb-1">Health Conditions</label>

  <div class="space-y-2">
    <label class="flex items-center space-x-3">
      <input 
        type="checkbox" 
        value="None" 
        :checked="localData.medical.includes('None')" 
        @change="toggleMedical('None', $event)" 
      />
      <span>No Condition</span>
    </label>
    <label class="flex items-center space-x-3">
      <input 
        type="checkbox" 
        value="Hypertension" 
        :checked="localData.medical.includes('Hypertension')" 
        @change="toggleMedical('Hypertension', $event)" 
      />
      <span>Hypertension</span>
    </label>
    <label class="flex items-center space-x-3">
      <input 
        type="checkbox" 
        value="Diabetes" 
        :checked="localData.medical.includes('Diabetes')" 
        @change="toggleMedical('Diabetes', $event)" 
      />
      <span>Diabetes</span>
    </label>
    <label class="flex items-center space-x-3">
      <input 
        type="checkbox" 
        value="Colon" 
        :checked="localData.medical.includes('Colon')" 
        @change="toggleMedical('Colon', $event)" 
      />
      <span>Colon</span>
    </label>
    <label class="flex items-center space-x-3">
      <input 
        type="checkbox" 
        value="Cholesterol" 
        :checked="localData.medical.includes('Cholesterol')" 
        @change="toggleMedical('Cholesterol', $event)" 
      />
      <span>Cholesterol</span>
    </label>
  </div>
</div>

        <!-- Diet -->
        <div>
          <label class="block text-gray-700 mb-1">Diet Type (Optional)</label>
          <select
            v-model="localData.diet"
            class="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Diet Type</option>
            <option value="Bland">Bland Diet</option>
            <option value="High-Protein">High-Protein</option>
            <option value="High-Fiber">High-Fiber</option>
            <option value="Low-Saturated Fat">Low-Saturated Fat</option>
            <option value="DASH">DASH</option>
          </select>
        </div>

        <!-- Join Date -->
        <div>
          <label class="block text-gray-700 mb-1">Join Date</label>
          <input
            v-model="localData.joinDate"
            type="date"
            disabled
            class="w-full border rounded-lg px-4 py-2 bg-gray-100"
          />
        </div>

        <!-- Goal -->
        <div>
          <label class="block text-gray-700 mb-1">Goal</label>
          <select
            v-model="localData.goal"
            class="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Goal</option>
            <option value="Lose Weight">Lose Weight</option>
            <option value="Gain Weight">Gain Weight</option>
            <option value="Maintain Weight">Maintain Weight</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="flex items-center justify-center space-x-6">

          <NuxtLink to="/register2">
            <button
              class="mt-14 bg-white text-green-600 px-8 py-2 rounded-xl border border-green-600 font-semibold hover:bg-green-50"
            >
              Back
            </button>
          </NuxtLink>

         <button
            @click="submitForm" 
            type="button"
            :disabled="!isFormValid"
            :class="[
              'mt-14 px-10 py-2 rounded-xl transition-all duration-300 font-semibold',
              isFormValid 
                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-md opacity-100' 
                : 'bg-green-600 text-white opacity-40 cursor-not-allowed'
            ]"
          >
            Done
          </button>




        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

/* =========================
    Router
========================= */
const router = useRouter()

/* =========================
    Base data
========================= */
const todayDate = new Date().toISOString().split("T")[0]

const localData = ref({
  firstName: '',
  lastName: '',
  birthDate: '',
  age: '',
  gender: '',
  currentWeight: '',
  targetWeight: '',
  height: '',
  activity: '',
  medical: [],
  diet: '',
  joinDate: todayDate,
  goal: ''
})

/* =========================
    Age calculation
========================= */
watch(
  () => localData.value.birthDate,
  (newBirthDate) => {
    if (!newBirthDate) {
      localData.value.age = ''
      return
    }

    const today = new Date()
    const birth = new Date(newBirthDate)

    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    localData.value.age = age
  }
)

/* =========================
    Medical logic (كما هو)
========================= */
function toggleMedical(value, event) {
  if (value === 'None') {
    localData.value.medical = event.target.checked ? ['None'] : []
  } else {
    if (event.target.checked) {
      localData.value.medical = localData.value.medical.filter(v => v !== 'None')
      localData.value.medical.push(value)
    } else {
      localData.value.medical = localData.value.medical.filter(v => v !== value)
    }
  }
}

/* =========================
    Shared state (Email + Password)
========================= */
const register2 = useState('register2')

/* =========================
    Mapping
========================= */
const activityMap = {
  Low: 1,
  Moderate: 2,
  High: 3
}
const goalMap = {
  'Lose Weight': 1,
  'Gain Weight': 2,
  'Maintain Weight': 3
}
const dietMap = {
  'Bland': 2,
  'High-Protein': 3,
  'High-Fiber': 4,
  'Low-Saturated Fat': 5,
  'DASH': 6
}
const diseaseMap = {
  'None': 1,
  'Hypertension': 3,
  'Diabetes': 2,
  'Colon': 5,
  'Cholesterol': 4
}

/* =========================
    Validation Logic
========================= */
const isFormValid = computed(() => {
  const d = localData.value;
  
  // التأكد من التاريخ (ليس في المستقبل)
  const isBirthDateValid = d.birthDate && d.birthDate <= todayDate;

  // المعايير العالمية (الطول > 50، الوزن > 20)
  const isWeightValid = d.currentWeight >= 20;
  const isTargetWeightValid = d.targetWeight >= 20;
  const isHeightValid = d.height >= 50;

  return (
    d.firstName && 
    d.lastName && 
    isBirthDateValid && 
    d.gender && 
    isWeightValid && 
    isTargetWeightValid && 
    isHeightValid && 
    d.activity && 
    d.goal &&
    d.medical.length > 0
  )
})

/* =========================
    Submit (FINAL & SAFE ✅)
========================= */
const submitForm = async () => {
  if (!register2.value?.Email) return;

  const fullData = {
    Email: register2.value.Email,
    Password: register2.value.Password,
    FirstName: localData.value.firstName,
    LastName: localData.value.lastName,
    BirthDate: localData.value.birthDate,
    Gender: localData.value.gender,
    Height: localData.value.height,
    CurrentWeight: localData.value.currentWeight,
    DesiredWeight: localData.value.targetWeight,
    ActiveLevelID: activityMap[localData.value.activity],
    GoalID: goalMap[localData.value.goal],
    DietTypeID: dietMap[localData.value.diet] || null,
    MedicalConditions: localData.value.medical.map(m => diseaseMap[m])
  }

  try {
  const res = await $fetch('http://localhost:5000/api/user', {
    method: 'POST',
    body: fullData
  });
  
  if (res.success) {
    // حفظ الإيميل في المتصفح لاستخدامه في صفحة التفعيل
    localStorage.setItem('pendingEmail', register2.value.Email);
    register2.value = null;
    // التحويل الفوري لصفحة التحقق المنفصلة
    router.push('/verify-account');
  }
}
  catch (err) {
    alert(err.data?.message || 'Email already exists or server error');
  }
}


import { onMounted } from 'vue'

onMounted(() => {
  const inputs = Array.from(document.querySelectorAll('input, select'))
  inputs.forEach((input, index) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        // Auto Trans
        const next = inputs[index + 1]
        if (next) next.focus()
      }
    })
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

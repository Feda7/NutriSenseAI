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
            placeholder="Enter your target weight"
            class="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <!-- Height -->
        <div>
          <label class="block text-gray-700 mb-1">Height (cm)</label>
          <input
            v-model="localData.height"
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
              <input type="checkbox" value="No Condition" v-model="localData.medical" />
              <span>No Condition</span>
            </label>
            <label class="flex items-center space-x-3">
              <input type="checkbox" value="Hypertension" v-model="localData.medical" />
              <span>Hypertension</span>
            </label>
            <label class="flex items-center space-x-3">
              <input type="checkbox" value="Diabetes" v-model="localData.medical" />
              <span>Diabetes</span>
            </label>
            <label class="flex items-center space-x-3">
              <input type="checkbox" value="Colon" v-model="localData.medical" />
              <span>Colon</span>
            </label>
            <label class="flex items-center space-x-3">
              <input type="checkbox" value="Cholesterol" v-model="localData.medical" />
              <span>Cholesterol</span>
            </label>
          </div>
        </div>

        <!-- Diet -->
        <div>
          <label class="block text-gray-700 mb-1">Diet Type</label>
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

          <NuxtLink :to="isFormValid ? '/profile' : ''">
            <button
              class="mt-14 bg-green-600 text-white px-10 py-2 rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!isFormValid"
            >
              Done
            </button>
          </NuxtLink>

        </div>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const modelValue = defineModel()

// 🔥 تاريخ اليوم تلقائي
const todayDate = new Date().toISOString().split("T")[0]

const localData = ref({
  ...modelValue.value,
  medical: modelValue.value?.medical || [],
  joinDate: todayDate,
  age: modelValue.value?.age || ""
})

// 🔥 حساب العمر تلقائياً
watch(
  () => localData.value.birthDate,
  (newBirthDate) => {
    if (!newBirthDate) {
      localData.value.age = ""
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

// تحديث البيانات للأب
watch(localData, () => (modelValue.value = localData.value))

const isFormValid = computed(() => {
  return (
    localData.value.firstName &&
    localData.value.lastName &&
    localData.value.birthDate &&
    localData.value.age &&
    localData.value.gender &&
    localData.value.currentWeight &&
    localData.value.height &&
    localData.value.activity &&
    localData.value.medical.length > 0 &&
    localData.value.diet &&
    localData.value.goal &&
    localData.value.targetWeight &&
    localData.value.joinDate
  )
})
</script>
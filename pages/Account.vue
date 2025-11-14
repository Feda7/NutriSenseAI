<template>
    <div class="min-h-screen bg-gray-50 font-sans py-12 px-4 ">
  <section class="h-auto py-8 my-10 bg-white shadow-md  rounded-2xl  max-w-3xl mx-auto ">
    <div class="space-y-4 m-10">
      <h2 class="text-2xl font-semibold text-green-600 mb-16">Create Your Account</h2>

      <!-- Full Name -->
      <div>
        <label class="block text-gray-700 mb-1">Full Name</label>
        <input
          v-model="localData.fullName"
          type="text"
          placeholder="Enter your Name"
          class="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-gray-700 mb-1">Email</label>
        <input
          v-model="localData.email"
          type="email"
          placeholder="example@email.com"
          class="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <!-- Password -->
      <div class="relative">
        <label class="block text-gray-700 mb-1">Password</label>
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="localData.password"
          class="w-full border rounded-lg px-4 py-2 pr-10"
          placeholder="Enter your password"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-9 text-gray-500"
        >
        </button>
      </div>

      <!-- Birthdate -->
      <div>
        <label class="block text-gray-700 mb-1">Birth Date</label>
        <input
          v-model="localData.birthDate"
          type="date"
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

      <!-- Medical Condition -->
      <div>
        <label class="block text-gray-700 mb-1">Health Condition</label>
        <select
          v-model="localData.medical"
          class="w-full border rounded-lg px-4 py-2"
        >
          <option value="">Select health condition</option>
          <option value="Hypertension">Hypertension</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Colon">Colon</option>
          <option value="Cholesterol">Cholesterol</option>
        </select>
      </div>

      <!-- Diet Type -->
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
        
        <NuxtLink to="/SectionWelcome">
          <button
            class="mt-14 bg-white text-green-600 px-8 py-2 rounded-xl border border-green-600    font-semibold hover:bg-green-50 "
          >
            Back
          </button>
        </NuxtLink>

        <NuxtLink :to="isFormValid ? '/profile' : ''">
          <button
            class="mt-14 bg-green-600 text-white px-10 py-2 rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!isFormValid"
          >
            Go
          </button>
        </NuxtLink>

      </div>

    </div>
  </section>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const modelValue = defineModel()
const localData = ref({ ...modelValue.value })
const showPassword = ref(false)

watch(localData, () => (modelValue.value = localData.value))

// 🔥 التحقق من اكتمال جميع الحقول
const isFormValid = computed(() => {
  return (
    localData.value.fullName &&
    localData.value.email &&
    localData.value.password &&
    localData.value.birthDate &&
    localData.value.activity &&
    localData.value.medical &&
    localData.value.diet &&
    localData.value.goal
  )
})
</script>
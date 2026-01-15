<template>
  <div class="min-h-screen bg-gray-50 font-sans py-12 px-4">
    <section class="h-auto py-8 my-10 bg-white shadow-md rounded-2xl max-w-3xl mx-auto">
      <div class="space-y-4 m-10">
        
        <h2 class="text-2xl font-semibold text-green-600 mb-16">Create Your Account</h2>

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
          ></button>
        </div>

        <!-- Buttons -->
        <div class="flex items-center justify-center space-x-6">

          <!-- Create Account -->
          <NuxtLink to="/register">
            <button
              class="mt-14 bg-white text-green-600 px-8 py-2 rounded-xl border border-green-600 font-semibold hover:bg-green-50"
            >
              Back
            </button>
          </NuxtLink>

          <!-- Login -->
          <NuxtLink :to="isFormValid ? '/Account' : ''">
            <button
              class="mt-14 bg-green-600 text-white px-10 py-2 rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!isFormValid"
            >
             Next
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
const localData = ref({ ...modelValue.value })

const showPassword = ref(false)

watch(localData, () => (modelValue.value = localData.value))

const isFormValid = computed(() => {
  return localData.value.email && localData.value.password
})


</script>
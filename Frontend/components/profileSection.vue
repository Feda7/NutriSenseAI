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
        class="w-56 h-56 rounded-full border object-cover "
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

    <div class="border-t pt-4 space-y-3">
      <h3 class="text-lg font-semibold text-gray-800">About Me</h3>
      <textarea
        v-model="localUser.about"
        :readonly="!editing"
        class="w-full border rounded-lg px-3 py-2 text-gray-600 resize-none"
      ></textarea>

      <h3 class="text-lg font-semibold text-gray-800">
        Why I Want to Get in Shape
      </h3>
      <textarea
        v-model="localUser.reason"
        :readonly="!editing"
        class="w-full border rounded-lg px-3 py-2 text-gray-600 resize-none"
      ></textarea>

      <h3 class="text-lg font-semibold text-gray-800">My Inspirations</h3>
      <textarea
        v-model="localUser.inspiration"
        :readonly="!editing"
        class="w-full border rounded-lg px-3 py-2 text-gray-600 resize-none"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['user'])
const emit = defineEmits(['updateUser'])

const localUser = ref({ ...props.user })
const editing = ref(false)

const isFormValid = computed(() => {
  const u = localUser.value
  return (
    u.photo &&
    u.name &&
    u.age &&
    u.height &&
    u.weight &&
    u.about &&
    u.reason &&
    u.inspiration
  )
})

function toggleEdit() {
  if (editing.value) {
    if (!isFormValid.value) {
      alert('⚠ Please fill all fields before saving.')
      return
    }
    emit('updateUser', localUser.value)
    alert('✅ Profile updated successfully!')
  }
  editing.value = !editing.value
}

function choosePhoto() {
  document.getElementById('photoInput').click()
}

function handlePhoto(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => {
    localUser.value.photo = evt.target.result
  }
  reader.readAsDataURL(file)
}
</script>
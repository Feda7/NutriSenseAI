<template>
  <div class="bg-white shadow-md rounded-2xl p-6 mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-green-600">Profile</h2>
      <button
        type="button"
        @click="toggleEdit"
        class="text-green-600 font-medium hover:text-green-700 transition"
      >
        {{ editing ? 'Save ' : 'Edit Profile ' }}
      </button>
    </div>

    <!-- Profile Photo -->
    <div class="flex items-center gap-4 mb-6">
      <img
        :src="localUser.photo"
        alt="Profile photo"
        class="w-56 h-56 rounded-full border object-cover"
      />
      <div>
        <input type="file" id="photoInput" class="hidden" @change="handlePhoto" />
        <button
          v-if="editing"
          type="button"
          @click="choosePhoto"
          class="bg-gray-100 text-sm text-gray-600 px-3 py-1 rounded-lg hover:bg-green-500 hover:text-white "
        >
          Change Photo
        </button>
      </div>
    </div>

    <!-- Profile Info -->
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

    <!-- About Section -->
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
import { ref } from 'vue'

// نستقبل بيانات المستخدم من الصفحة الرئيسية
const props = defineProps(['user'])
const emit = defineEmits(['updateUser'])

// ننسخ بيانات المستخدم محلياً حتى نقدر نعدلها
const localUser = ref({ ...props.user })

// هذا المتغير يتحكم في وضع التعديل
const editing = ref(false)

// زر التبديل بين Edit / Save
function toggleEdit() {
  // إذا كنا في وضع "Save"، نحدث البيانات الأصلية
  if (editing.value) {
    emit('updateUser', localUser.value)
    alert('✅ Profile updated successfully!')
  }
  // بعدين نعكس الوضع (من Edit إلى Save والعكس)
  editing.value = !editing.value
}

// فتح اختيار الصورة
function choosePhoto() {
  document.getElementById('photoInput').click()
}

// التعامل مع الصورة الجديدة
function handlePhoto(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      localUser.value.photo = event.target.result
      emit('updateUser', localUser.value)
    }
    reader.readAsDataURL(file)
  }
}
</script>

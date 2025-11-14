<template>
    <div class="bg-white shadow-md rounded-2xl p-6">

        <!-- Title & Add Buttons -->
        <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>

        <div class="flex gap-3">
            <!-- ADD MANUALLY -->
            <button
            @click="manualInput = true"
            class="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
            >
            + Add Food
            </button>

            <!-- UPLOAD PHOTO -->
            <button
            @click="triggerImage"
            class="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
            >
            take a Photo
            </button>

            <input type="file" class="hidden" ref="imageInput" @change="handleImage" />
        </div>
        </div>

        <!-- Manual Add Modal -->
        <div v-if="manualInput" class="space-y-2 mb-4">
        <input v-model="food.name" placeholder="Food name" class="border rounded-lg w-full px-3 py-1" />
        <input v-model.number="food.calories" placeholder="Calories" class="border rounded-lg w-full px-3 py-1" />
        <input v-model.number="food.protein" placeholder="Protein" class="border rounded-lg w-full px-3 py-1" />
        <input v-model.number="food.carbs" placeholder="Carbs" class="border rounded-lg w-full px-3 py-1" />
        <input v-model.number="food.fat" placeholder="Fat" class="border rounded-lg w-full px-3 py-1" />

        <button
            @click="addFood"
            class="bg-green-600 text-white px-4 py-2 rounded-lg w-full"
        >
            Save Food
        </button>
        </div>

        <!-- Food Items List -->
        <div class="space-y-3">
        <div
            v-for="(item, index) in items"
            :key="index"
            class="p-3 border rounded-xl bg-gray-50"
        >
            <div class="flex justify-between">
            <p class="font-semibold">{{ item.name }}</p>
            <p class="font-semibold text-green-600">{{ item.calories }} cal</p>
            </div>

            <div class="text-sm text-gray-600 mt-1">
            Protein: {{ item.protein }}g • Carbs: {{ item.carbs }}g • Fat: {{ item.fat }}g
            </div>
        </div>
        </div>

    </div>
</template>

<script setup>

const props = defineProps(['title', 'items', 'mealName'])
const emit = defineEmits(['addFood', 'uploadImage'])

const manualInput = ref(false)
const food = ref({
  name: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
})

function addFood() {
  emit('addFood', props.mealName, { ...food.value })
  manualInput.value = false
  food.value = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }
}

function triggerImage() {
  imageInput.value.click()
}

const imageInput = ref(null)

function handleImage(e) {
  const file = e.target.files[0]
  if (file) emit('uploadImage', props.mealName, file)
}
</script>

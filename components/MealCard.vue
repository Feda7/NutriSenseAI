<template>
    <div class="bg-white shadow-md rounded-2xl p-6">

        <!-- Title & Buttons -->
        <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>

        <div class="flex gap-3">
            <button
            @click="manualInput = true"
            class="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
            >
            + Add Food
            </button>

            <button
            @click="triggerImage"
            class="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
            >
            📷
            </button>

            <input type="file" ref="imageInput" class="hidden" @change="handleImage" />
        </div>
        </div>

        <!-- Manual Input -->
        <div v-if="manualInput" class="mb-4 space-y-2">
        <input v-model="food.name" placeholder="Food name" class="inputt" />
        <input v-model.number="food.calories" placeholder="Calories" class="inputt"  />
        <input v-model.number="food.protein" placeholder="Protein" class="inputt"  />
        <input v-model.number="food.carbs" placeholder="Carbs" class="inputt"  />
        <input v-model.number="food.fat" placeholder="Fat" class="inputt"  />

        <button
            @click="addFood"
            class="bg-green-600 text-white w-full py-2 rounded-lg"
        >
            Save Food
        </button>
        </div>

        <!-- Food List -->
        <div class="space-y-3">
        <div
            v-for="(item, index) in items"
            :key="index"
            class="p-3 rounded-xl border bg-gray-50"
        >
            <div class="flex justify-between">
            <p class="font-semibold">{{ item.name }}</p>
            <p class="font-semibold text-green-600">{{ item.calories }} cal</p>
            </div>

            <p class="text-sm text-gray-600">
            Protein: {{ item.protein }}g • Carbs: {{ item.carbs }}g • Fat: {{ item.fat }}g
            </p>
        </div>
        </div>

        <!-- Recommendation -->
        <p v-if="recommendation" class="mt-4 text-sm font-medium text-green-700">
        {{ recommendation }}
        </p>

    </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps(["title", "items", "mealName", "dietType"]);
const emit = defineEmits(["addFood", "uploadImage"]);

const manualInput = ref(false);
const recommendation = ref("");

const food = ref({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
});

/* --- Save Food --- */
function addFood() {
  if (!food.value.name.trim()) return; // prevent empty entries

    emit("addFood", props.mealName, { ...food.value });
    generateRecommendation(food.value);
    manualInput.value = false;

    food.value = { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 };
}


/* --- Image Upload Trigger --- */
const imageInput = ref(null);
function triggerImage() {
    imageInput.value.click();
}
function handleImage(e) {
    const file = e.target.files[0];
    emit("uploadImage", props.mealName, file);

  // Temporary sample for AI result (replace with model output later)
    generateRecommendation({
        calories: 300,
        protein: 20,
        carbs: 25,
        fat: 10,
    });
}

/* --- Recommendation System (Diet-based) --- */
function generateRecommendation(food) {
  const diet = props.dietType;
  let text = "";

    if (diet === "Bland") {
        if (food.fat > 15)
        text = "This meal contains high fat, which is not suitable for a Bland Diet.";
        else if (food.carbs > 40)
        text = "Carbohydrates are high and may irritate the stomach.";
        else
        text = "Your meal is light and suitable for a Bland Diet.";
    }

    else if (diet === "High-Protein") {
        if (food.protein < 20)
        text = "Your meal is low in protein, which does not fit the High-Protein Diet.";
        else
        text = "Great choice! Your meal is high in protein.";
    }

    else if (diet === "High-Fiber") {
        if (food.carbs < 15)
        text = "Your meal is low in fiber. Try adding vegetables or whole grains.";
        else
        text = "Your meal is high in fiber and suitable for the High-Fiber Diet.";
    }

    else if (diet === "Low-Saturated Fat") {
        if (food.fat > 18)
        text = "This meal contains high fat, which is not suitable for a Low-Saturated Fat Diet.";
        else
        text = "Your meal is low in fat and suitable for your diet.";
    }

    else if (diet === "DASH") {
        if (food.fat > 20)
        text = "Fat is too high, which is not recommended for the DASH Diet.";
        else if (food.carbs > 50)
        text = "Sugar levels are high, which is not suitable for people following DASH.";
        else
        text = "Your meal is balanced and fits well with the DASH Diet.";
    }

    recommendation.value = text;
}
</script>


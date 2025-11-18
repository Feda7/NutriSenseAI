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
        <input v-model.number="food.calories" placeholder="Calories" class="inputt" />
        <input v-model.number="food.protein" placeholder="Protein" class="inputt" />
        <input v-model.number="food.carbs" placeholder="Carbs" class="inputt" />
        <input v-model.number="food.fat" placeholder="Fat" class="inputt" />
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

const props = defineProps(["title", "items", "mealName", "dietType", "diseases"]);
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
    if (!food.value.name.trim()) return;
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
    generateRecommendation({
        calories: 300,
        protein: 20,
        carbs: 25,
        fat: 10,
    });
}

/* --- Recommendation System --- */
function generateRecommendation(food) {
    let messages = [];
    /* ⭐ ZERO FOOD CHECK */
    if (
        food.calories === 0 &&
        food.protein === 0 &&
        food.carbs === 0 &&
        food.fat === 0
    ) {
        recommendation.value =
        "This food contains no calories or nutrients. Please enter valid values.";
        return;
    }
    /* ⭐ DIET TYPE RECOMMENDATION */
    const dietMsg = getDietRecommendation(food, props.dietType);
    if (dietMsg) messages.push(dietMsg);
    /* ⭐ DISEASES RECOMMENDATION */
    const diseaseMsgs = getDiseaseAlerts(food, props.diseases);
    messages.push(...diseaseMsgs);
    /* ⭐ FINAL MESSAGE */
    recommendation.value = messages.join(" ");
}

/* ------ Diet Logic ------ */
function getDietRecommendation(food, diet) {
    if (diet === "Bland") {
        if (food.fat > 15) return "High fat is not suitable for a Bland Diet.";
        if (food.carbs > 40) return "High carbs may irritate the stomach.";
        return "This meal fits well with the Bland Diet.";
    }
    if (diet === "High-Protein") {
        if (food.protein < 20) return "Protein is too low for a High-Protein Diet.";
        return "Great choice! High in protein.";
    }
    if (diet === "High-Fiber") {
        if (food.carbs < 15) return "Fiber is low. Add vegetables or whole grains.";
        return "Your meal is rich in fiber.";
    }
    if (diet === "Low-Saturated Fat") {
        if (food.fat > 18) return "Fat level is too high for a Low-Saturated Fat Diet.";
        return "Low fat — good for your diet.";
    }
    if (diet === "DASH") {
        if (food.fat > 20) return "Fat is too high for DASH.";
        if (food.carbs > 50) return "Sugars are too high for DASH.";
        return "Balanced meal suitable for DASH.";
    }
    return "";
}

/* ------ Disease Logic ------ */
function getDiseaseAlerts(food, diseases = []) {
    const alerts = [];
    if (!Array.isArray(diseases)) return alerts;
    diseases.forEach((disease) => {
        if (disease === "Hypertension") {
        if (food.fat > 20)
            alerts.push("High fat is not recommended for hypertension.");
        if (food.carbs > 50)
            alerts.push("High sugar can increase blood pressure.");
        }
        if (disease === "Diabetes") {
        if (food.carbs > 30)
            alerts.push("Carbohydrates are high and can affect blood sugar levels.");
        if (food.calories > 400)
            alerts.push("High-calorie meals are not suitable for diabetes.");
        }
        if (disease === "Colon") {
        if (food.fat > 15)
            alerts.push("High fat may irritate the colon.");
        if (food.carbs < 10)
            alerts.push("Low fiber may increase colon issues.");
        }
        if (disease === "Cholesterol") {
        if (food.fat > 15)
            alerts.push("High fat can raise cholesterol levels.");
        }
    });
    return alerts;
}
</script>

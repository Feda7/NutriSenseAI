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

        <!-- Manual Input (SEARCH VERSION) -->
        <div v-if="manualInput" class="mb-4 space-y-2">

        <!-- 🔎 Search -->
        <input
            v-model="search"
            @input="searchFood"
            placeholder="Food name"
            class="inputt"
        />

        <!-- Search Results -->
        <div v-if="results.length" class="border rounded-lg bg-white">
            <div
                v-for="item in results"
                :key="item.FoodItemID"
                @click="selectFood(item)"
                class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
                {{ item.Name }}
            </div>
        </div>
        <input type="number" v-model="quantity" class="inputt" placeholder="Quantity" />
        <select v-model="unitId" class="inputt">
            <option v-for="unit in units" :key="unit.unitId" :value="unit.unitId"
            >
                {{ unit.shortCode }}
            </option>
        </select>
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
            <p class="font-semibold text-green-600">{{ item.totalCalories }} cal</p>
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
import { onMounted } from "vue";

const props = defineProps(["title", "items", "mealName", "dietType", "diseases"]);
const emit = defineEmits(["addFood", "uploadImage"]);
const manualInput = ref(false);
const recommendation = ref("");
/* 🔎 Search State */
const search = ref("");
const results = ref([]);
const selectedFood = ref(null);
/* ➕ Quantity + Unit (جديدة) */
const quantity = ref(1);
const unitId = ref(1);
const units = ref([])

onMounted(() => {
    loadUnits();
});

async function loadUnits() {
    try {
        const response = await fetch("http://localhost:3000/api/units")
        units.value = await response.json()

        if (units.value.length > 0) {
        unitId.value = units.value[0].unitId
        }

    } catch (error) {
        console.error("Failed to load units", error)
    }
}

/* --- SEARCH FUNCTION --- */
async function searchFood() {
    if (!search.value.trim()) {
        results.value = [];
        return;
    }

    const res = await fetch(
        `http://localhost:5000/api/food/search?q=${search.value}`
    );

    results.value = await res.json();
}

/* --- Select Food --- */
async function selectFood(item) {
    selectedFood.value = item;
    search.value = item.Name;
    results.value = [];

    try {
        const res = await fetch(
        `http://localhost:5000/api/food/${item.FoodItemID}/units`
        );
        units.value = await res.json();

        if (units.value.length > 0) {
        unitId.value = units.value[0].unitId;
        }

    } catch (error) {
        console.error("Failed to load food units", error);
    }
}

/* --- Save Food --- */
function addFood() {
    if (!selectedFood.value) {
        alert("Item not found");
        return;
    }

    const foodData = {
        foodItemId: selectedFood.value.FoodItemID, // ⭐ هذا المهم
        quantity: quantity.value,
        unitId: unitId.value,

        // نخلي بيانات التغذية للتوصيات
        name: selectedFood.value.Name,
        calories: selectedFood.value.Calories,
        protein: selectedFood.value.Protein,
        carbs: selectedFood.value.Carbs,
        fat: selectedFood.value.Fat,
    };

    emit("addFood", props.mealName, foodData);

    generateRecommendation(foodData);

    manualInput.value = false;
    search.value = "";
    selectedFood.value = null;
    quantity.value = 1;
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

    const dietMsg = getDietRecommendation(food, props.dietType);
    if (dietMsg) messages.push(dietMsg);

    const diseaseMsgs = getDiseaseAlerts(food, props.diseases);
    messages.push(...diseaseMsgs);

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
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
import { ref, computed, watch, onMounted } from "vue";

// التعديل الأساسي هنا: أضفنا Number لتعريف الـ prop الخاص بـ dietType
const props = defineProps({
    title: String,
    items: Array,
    mealName: String,
    dietType: [Number, String, Object], 
    diseases: Array
});

const emit = defineEmits(["addFood", "uploadImage"]);

const manualInput = ref(false);
const recommendation = ref("");

const search = ref("");
const results = ref([]);
const selectedFood = ref(null);

const quantity = ref(1);
const unitId = ref(1);
const units = ref([]);

onMounted(() => {
    loadUnits();
});

const imageInput = ref(null);

// 2. دالة لفتح نافذة اختيار الصور عند ضغط زر الكاميرا
function triggerImage() {
    imageInput.value.click();
}

// 3. دالة لمعالجة الصورة المختارة وإرسالها لصفحة food.vue
function handleImage(event) {
    const file = event.target.files[0];
    if (file) {
        // نرسل اسم الوجبة والملف
        emit("uploadImage", props.mealName, file);
    }
}

async function loadUnits() {
    try {
        const response = await fetch("http://localhost:5000/api/units");
        units.value = await response.json();
        if (units.value.length > 0) {
            unitId.value = units.value[0].unitId;
        }
    } catch (error) {
        console.error("Failed to load units", error);
    }
}

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

function addFood() {
    if (!selectedFood.value) {
        alert("Item not found");
        return;
    }

    const foodData = {
        foodItemId: selectedFood.value.FoodItemID,
        quantity: quantity.value,
        unitId: unitId.value,

        name: selectedFood.value.Name,
        totalCalories: selectedFood.value.Calories * quantity.value,
        protein: selectedFood.value.Protein * quantity.value,
        carbs: selectedFood.value.Carbs * quantity.value,
        fat: selectedFood.value.Fat * quantity.value,
        fiber: selectedFood.value.Fiber * quantity.value,
        sodium: selectedFood.value.Sodium * quantity.value,
        cholesterol: selectedFood.value.Cholesterol * quantity.value,
    };

    // إرسال البيانات المحدثة بالكامل للـ الباك إند والصفحة الرئيسية
    emit("addFood", props.mealName, foodData);

    // إعادة تصفير الحقول بعد الحفظ
    manualInput.value = false;
    search.value = "";
    selectedFood.value = null;
    quantity.value = 1;
}

/* ================= TOTALS ================= */

const totals = computed(() => {
    return props.items.reduce(
        (acc, item) => {
            // نستخدم الأسماء الصغيرة كما تأتي من الباك أند المحدث
            acc.calories += Number(item.totalCalories || 0);
            acc.protein += Number(item.protein || 0);
            acc.carbs += Number(item.carbs || 0);
            acc.fat += Number(item.fat || 0);
            acc.fiber += Number(item.fiber || 0);
            acc.sodium += Number(item.sodium || 0);
            acc.cholesterol += Number(item.cholesterol || 0);
            return acc;
        },
        {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sodium: 0,
            cholesterol: 0,
        }
    );
});

watch(
    () => [totals.value, props.dietType, props.diseases],
    () => {
        generateRecommendation();
    },
    { deep: true }
);

/* ================= RECOMMENDATION ================= */

function generateRecommendation() {
    const food = totals.value;
    
    // 🔥 هذا هو السطر السحري: إذا السعرات 0، لا تظهر أي نصيحة
    if (food.calories === 0) {
        recommendation.value = "";
        return;
    }

    let messages = [];

    const dietMsg = getDietRecommendation(food);
    if (dietMsg) messages.push(dietMsg);

    const diseaseMsgs = getDiseaseAlerts(food);
    messages.push(...diseaseMsgs);

    recommendation.value = messages.join(" ");
}

/* ================= DIET LOGIC ================= */

function getDietRecommendation(food) {
    const diet = props.dietType;

    // الآن الكود سيدعم المقارنة بالأرقام (كما في قاعدة بياناتك) أو الأسماء
    if (diet === 2 || diet === "Bland") {
        if (food.fat > 15) return "High fat is not suitable for Bland Diet.";
        return "Meal fits Bland Diet.";
    }

    if (diet === 3 || diet === "High-Protein") {
        if (food.protein < 20) return "Protein is too low for High-Protein diet.";
        return "Great high-protein meal.";
    }

    if (diet === 4 || diet === "High-Fiber") {
        if (food.fiber < 8) return "Fiber is too low. Add vegetables.";
        return "Good fiber level.";
    }

    if (diet === 5 || diet === "Low-Saturated Fat") {
        if (food.fat > 18) return "Fat level too high.";
        return "Low fat meal.";
    }

    if (diet === 6 || diet === "DASH") {
        if (food.sodium > 1500) return "Too much sodium for DASH.";
        return "Suitable for DASH diet.";
    }

    return "";
}

/* ================= DISEASE ALERTS ================= */

function getDiseaseAlerts(food) {
    const alerts = [];
    const diseases = props.diseases || [];

    diseases.forEach((disease) => {
        if (disease === "Hypertension") {
            if (food.sodium > 1500)
                alerts.push("High sodium is risky for hypertension.");
        }

        if (disease === "Diabetes") {
            if (food.carbs > 45)
                alerts.push("High carbs may affect blood sugar.");
        }

        if (disease === "Cholesterol") {
            if (food.cholesterol > 300)
                alerts.push("High cholesterol intake.");
        }

        if (disease === "Colon") {
            if (food.fiber < 10)
                alerts.push("Low fiber not good for colon health.");
        }
    });

    return alerts;
}
</script>
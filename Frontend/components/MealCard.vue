<template>
    <div class="bg-white shadow-md rounded-2xl p-6">
        <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>

        <div class="flex gap-3">
            <button
            @click="openAddMode"
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

        <div v-if="manualInput" class="mb-4 space-y-2">

        <input
            v-model="search"
            @input="searchFood"
            placeholder="Food name"
            class="inputt"
            :disabled="isEditing"
        />

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
                {{ unit.shortCode || unit.ShortCode }}
            </option>
        </select>
        <button
            @click="saveFoodAction"
            class="bg-green-600 text-white w-full py-2 rounded-lg"
        >
            {{ isEditing ? 'Update Food' : 'Save Food' }}
        </button>
        </div>

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

            <div class="flex space-x-3 mt-2 pt-2 border-t border-gray-100">
                <button 
                @click="editFood(item)" 
                class="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
            >
                ✏️ Edit
            </button>

            <button 
                @click="deleteFood(item)" 
                class="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition"
            >
                🗑️ Delete
            </button>
            </div>
        </div>
        </div>

        <p v-if="recommendation" class="mt-4 text-sm font-medium text-green-700">
        {{ recommendation }}
        </p>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
    title: String,
    items: Array,
    mealName: String,
    dietType: [Number, String, Object], 
    diseases: Array,
    mealId: [Number, String] 
});

const emit = defineEmits(["addFood", "uploadImage", "refreshMeals"]);

const manualInput = ref(false);
const isEditing = ref(false); // 👈 متغير لمتابعة حالة التعديل
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

function triggerImage() {
    imageInput.value.click();
}

function handleImage(event) {
    const file = event.target.files[0];
    if (file) {
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
            unitId.value = units.value[0].unitId || units.value[0].UnitID;
        }
    } catch (error) {
        console.error("Failed to load food units", error);
    }
}

// 👈 دالة فتح نافذة الإضافة الحرة وتصفير وضع التعديل
function openAddMode() {
    isEditing.value = false;
    manualInput.value = true;
    search.value = "";
    selectedFood.value = null;
    quantity.value = 1;
    loadUnits();
}

// 👈 دالة التوجيه الذكية عند الحفظ للتفريق بين الإضافة والتعديل
async function saveFoodAction() {
    if (isEditing.value) {
        await submitEditFood();
    } else {
        await addFood();
    }
}

// دالة الإضافة العادية المستقرة
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

    emit("addFood", props.mealName, foodData);

    manualInput.value = false;
    search.value = "";
    selectedFood.value = null;
    quantity.value = 1;
}

// 👈 دالة إرسال التحديث الفعلي للباك إند (تمنع التكرار)
async function submitEditFood() {
    const foodId = selectedFood.value?.FoodItemID;
    const currentMealId = props.mealId;

    if (!currentMealId || !foodId) {
        alert("Missing IDs for update.");
        return;
    }

    const payload = {
        quantity: parseFloat(quantity.value),
        unitId: parseInt(unitId.value)
    };

    try {
        const res = await fetch(`http://localhost:5000/api/meal/${currentMealId}/food/${foodId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Meal item updated successfully! 🎉');
            manualInput.value = false;
            isEditing.value = false;
            search.value = "";
            selectedFood.value = null;
            quantity.value = 1;
            emit('refreshMeals'); // تحديث الواجهة والـ totals من قاعدة البيانات
        } else {
            const errData = await res.json();
            alert(`Failed to update: ${errData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating food item:', error);
        alert('Failed to update food item due to a network error.');
    }
}

/* ================= TOTALS ================= */

const totals = computed(() => {
    return props.items.reduce(
        (acc, item) => {
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

// مراقبة التغيرات لتحديث التوصيات تلقائياً
// Watch totals to trigger the smart Gemini AI feedback instantly on any change
watch(
    totals,
    async () => {
        await generateRecommendation();
    },
    { deep: true, immediate: true }
);
/* ================= EDIT & DELETE MEAL ================= */

const editFood = async (item) => {
    const foodId = item.foodItemId || item.FoodItemID || item.id;
    const currentMealId = props.mealId;

    if (!currentMealId || !foodId) {
        console.error("❌ Missing IDs:", { mealId: currentMealId, foodId: foodId });
        alert("Error: Cannot update item due to missing IDs.");
        return;
    }

    isEditing.value = true; // تفعيل وضع التعديل
    manualInput.value = true;
    
    selectedFood.value = {
        FoodItemID: foodId,
        Name: item.name || item.Name,
        Calories: item.Calories || item.calories || item.totalCalories
    };

    search.value = item.name || item.Name;
    quantity.value = item.quantity || 1;
    unitId.value = item.unitId || item.unitID || 1;

    try {
        const resUnits = await fetch(`http://localhost:5000/api/food/${foodId}/units`);
        if (resUnits.ok) {
            units.value = await resUnits.json();
        }
    } catch (error) {
        console.error('Error loading units for edit:', error);
    }
};

const deleteFood = async (item) => {
    const foodId = item.foodItemId || item.FoodItemID || item.id;
    const currentMealId = props.mealId;

    if (!currentMealId || !foodId) {
        console.error("❌ Missing IDs for deletion:", { mealId: currentMealId, foodId: foodId });
        alert("Error: Cannot delete item due to missing IDs.");
        return;
    }

    if (!confirm('Are you sure you want to delete this food item from the meal?')) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/meal/${currentMealId}/food/${foodId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            emit('refreshMeals'); 
            alert('Food item deleted successfully!');
        } else {
            alert('Failed to delete the food item.');
        }
    } catch (error) {
        console.error('Error deleting food:', error);
    }
};


/* ================= SMART AI RECOMMENDATION (GEMINI) ================= */
let debounceTimer;

async function generateRecommendation() {
    const food = totals.value;
    if (!food || Number(food.calories) === 0) return;

    // مسح الطلب السابق إذا تم إرسال طلب جديد بسرعة
    clearTimeout(debounceTimer);
    
    // الانتظار 2 ثانية قبل إرسال الطلب للـ API
    debounceTimer = setTimeout(async () => {
        recommendation.value = "Analyzing meal data... ✨";
        try {
            const res = await fetch("http://localhost:5000/api/recommendation/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    food: food,
                    dietType: props.dietType || "No specific diet",
                    diseases: props.diseases || []
                })
            });

            if (res.ok) {
                const data = await res.json();
                recommendation.value = data.recommendation;
            } else {
                recommendation.value = "Review your meal details.";
            }
        } catch (error) {
            recommendation.value = "Service temporarily unavailable.";
        }
    }, 2000); 
}
</script>
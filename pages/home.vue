 <template>
     <div class="min-h-screen bg-gray-50 py-12 px-6">

        <!-- Page Title -->
        <h1 class="text-3xl font-bold text-green-600 mb-10 text-center">
        Recommended Meals For You
        </h1>

        <!-- Meals Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <div
            v-for="meal in meals"
            :key="meal.id"
            class="bg-white p-5 shadow-md rounded-2xl border hover:shadow-lg transition"
        >
            <img :src="meal.image" class="w-full h-40 object-cover rounded-xl mb-3" />

            <h2 class="text-xl font-semibold text-gray-800">{{ meal.name }}</h2>
            <p class="text-gray-600 mt-1 text-sm">{{ meal.description }}</p>

            <div class="mt-3 text-sm text-gray-700">
            <p><strong>Protein:</strong> {{ meal.protein }} g</p>
            <p><strong>Carbs:</strong> {{ meal.carbs }} g</p>
            <p><strong>Fat:</strong> {{ meal.fat }} g</p>
            </div>

            <button
            @click="selectMeal(meal)"
            class="mt-4 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
            >
            Add Meal
            </button>
        </div>
        </div>

        <!-- Modal -->
        <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
        <div class="bg-white p-6 rounded-2xl w-80 shadow-lg space-y-4">

            <h3 class="text-lg font-semibold text-gray-800 text-center">
            Add to which meal?
            </h3>

            <button
            v-for="name in ['Breakfast','Lunch','Dinner','Snack']"
            :key="name"
            @click="addToMeal(name)"
            class="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
            >
            {{ name }}
            </button>

            <button
            @click="showModal = false"
            class="w-full bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300"
            >
            Cancel
            </button>

        </div>
        </div>

    </div>
</template>

<script setup>
import { ref } from "vue";
// //import { useFoodStore } from "@/stores/foodStore"; // Store that handles meals
// const food = useFoodStore();

// // Meals data (example)
// const meals = ref([
//     {
//         id: 1,
//         name: "Grilled Chicken Bowl",
//         description: "High-protein meal perfect for muscle recovery.",
//         protein: 42,
//         carbs: 25,
//         fat: 12,
//         image: "/meals/chicken-bowl.jpg",
//     },
//     {
//         id: 2,
//         name: "Oatmeal With Berries",
//         description: "High-fiber breakfast that boosts energy.",
//         protein: 8,
//         carbs: 40,
//         fat: 5,
//         image: "/meals/oatmeal.jpg",
//     },
//     {
//         id: 3,
//         name: "Greek Yogurt & Nuts",
//         description: "Perfect balanced snack with protein and healthy fats.",
//         protein: 14,
//         carbs: 10,
//         fat: 9,
//         image: "/meals/yogurt.jpg",
//     },
// ]);

// // Modal & Meal Selection
// const showModal = ref(false);
// const selectedMeal = ref(null);

// function selectMeal(meal) {
//     selectedMeal.value = meal;
//     showModal.value = true;
// }

// // Add to Food Page
// function addToMeal(mealName) {
//     if (!selectedMeal.value) return;

//     const item = selectedMeal.value;

//     food.addFromHome(mealName, {
//         name: item.name,
//         calories: item.protein * 4 + item.carbs * 4 + item.fat * 9,
//         protein: item.protein,
//         carbs: item.carbs,
//         fat: item.fat,
//     });

//     showModal.value = false;
// }
</script>

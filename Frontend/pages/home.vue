<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Suggested Meals Section -->
    <section class="px-20">
      <h2 class="text-2xl font-bold text-green-700 mb-6 pt-10">Suggested Meals</h2>
      <p class="text-lg text-green-700 mb-10">Here are today’s suggested meals tailored for a healthier life.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        <div 
          v-for="meal in meals"
          :key="meal.name"
          class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition px-7"
        >
          <img :src="meal.image" class="w-full h-56 object-cover rounded-2xl" />

          <div class="p-5 space-y-2">
            <h3 class="text-xl font-semibold text-gray-800">{{ meal.name }}</h3>

            <p class="text-gray-600 text-sm">
              {{ meal.calories }} cal • Protein {{ meal.protein }}g • Carbs {{ meal.carbs }}g • Fat {{ meal.fat }}g
            </p>

            <button 
              @click="selectMeal(meal)"
              class="mt-4 bg-green-600 text-white w-full py-2 rounded-xl hover:bg-green-700"
            >
              Add Meal
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- Advice Section -->
    <section class="px-20 mt-16">
      <h2 class="text-2xl font-bold text-green-700 mb-4">YOU ARE UNSTOPABLE✨</h2>
      <div class="bg-white shadow-md rounded-2xl p-6 space-y-4 border-l-4 border-green-500">
        <div v-for="(tip, index) in healthTips" :key="index" class="flex items-start gap-3">
          <span class="text-xl">{{ tip.emoji }}</span>
          <p class="text-gray-700 text-lg leading-relaxed">{{ tip.text }}</p>
        </div>
      </div>
    </section>

    <!-- Meal Selection Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
    >
      <div class="bg-white rounded-2xl p-8 w-80 shadow-lg">
        <h2 class="text-xl font-bold text-center mb-4">Add to which meal?</h2>

        <div class="space-y-3">
          <button
            v-for="type in mealTypes"
            :key="type"
            @click="chooseMeal(type)"
            class="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
          >
            {{ type }}
          </button>
        </div>

        <button
          class="mt-6 w-full py-2 text-gray-600 hover:text-gray-800"
          @click="showModal = false"
        >
          Cancel
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useState } from '#app' // أضفنا هذا السطر

const currentUser = useState('currentUser') // نستخدم نفس الـ state حقك

const meals = ref([])
const healthTips = ref([])
const showModal = ref(false)
const selectedMeal = ref(null)
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"]

onMounted(async () => {
    // 1. استرجاع البيانات من localStorage وتثبيتها في الـ useState
    const storedUser = localStorage.getItem('user');
    const userId = localStorage.getItem('userId'); 

    if (storedUser && !currentUser.value) {
        currentUser.value = JSON.parse(storedUser);
    }
    
    // إذا ما فيه يوزر آيدي، هنا المشكلة اللي كانت تطردك
    if (!userId) {
        console.error("User ID not found in localStorage");
        // router.push('/') // اختياري إذا حابة يرجع للإندكس برمجياً
        return;
    }

    try {
        const response = await axios.get(`http://localhost:5000/api/home-data/${userId}`);
        meals.value = response.data.suggestedMeals;
        healthTips.value = response.data.healthTips;
    } catch (error) {
        console.error("Error fetching home data:", error);
    }
})

// باقي الدوال (selectMeal و chooseMeal) تبقى كما هي بدون تغيير
function selectMeal(meal) {
    selectedMeal.value = meal
    showModal.value = true
}

async function chooseMeal(type) {
    const userId = localStorage.getItem('userId');
    try {
        await axios.post('http://localhost:5000/api/meal/add-suggested', {
            userId: userId,
            mealId: selectedMeal.value.id,
            mealType: type,
            date: new Date().toISOString().split('T')[0]
        });
        alert(`Successfully added ${selectedMeal.value.name} to your ${type}! 🎉`);
        showModal.value = false;
    } catch (error) {
        console.error("Error adding meal:", error);
        alert("Failed to add meal. Please try again.");
    }
}
</script>
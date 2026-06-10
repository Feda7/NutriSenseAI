<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <section class="px-20">
      <h2 class="text-2xl font-bold text-green-700 mb-6 pt-10">Suggested Meals</h2>
      <p class="text-lg text-green-700 mb-10">Here are today’s suggested meals tailored for a healthier life.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="(meal, index) in (meals && meals.length ? meals : Array(6).fill({
            temp_name: 'Healthy Suggestion 🥗',
            temp_calories: 350,
            temp_protein: 15,
            temp_carb: 40,
            temp_fat: 8
          }))" 
          :key="index" 
          class="bg-white p-4 rounded-xl shadow-md border border-gray-100"
        >
          <img 
            :src="meal.temp_image && meal.temp_image !== 'NULL' && meal.temp_image !== '' ? meal.temp_image : getMealFallbackImage(meal.temp_name)" 
            alt="meal" 
            class="rounded-lg w-full h-40 object-cover mb-4"
            @error="(e) => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500'"
          >
          
          <h3 class="font-bold text-lg mb-1">{{ meal.temp_name || 'Healthy Suggestion 🥗' }}</h3>
          <p class="text-sm text-gray-500 mb-4">
            {{ meal.temp_calories }} cal • Protein {{ meal.temp_protein }}g • Carbs {{ meal.temp_carbs || meal.temp_carb }}g • Fat {{ meal.temp_fat }}g
          </p>
          <button @click="selectMeal(meal)" class="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition">
            Add Meal
          </button>
        </div>
      </div>
    </section>

    <section class="px-20 mt-16">
      <h2 class="text-2xl font-bold text-green-700 mb-4">YOU ARE UNSTOPPABLE✨</h2>
      <div class="bg-white shadow-md rounded-2xl p-6 space-y-4 border-l-4 border-green-500">
        <div v-for="(tip, index) in healthTips" :key="index" class="flex items-start gap-3">
          <span class="text-xl">{{ tip.emoji }}</span>
          <p class="text-gray-700 text-lg leading-relaxed">{{ tip.text }}</p>
        </div>
      </div>
    </section>

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
import { useState } from '#app' 

const currentUser = useState('currentUser') 

const meals = ref([])
const healthTips = ref([])
const showModal = ref(false)
const selectedMeal = ref(null)
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"]

onMounted(async () => {
    const storedUser = localStorage.getItem('user');
    let userId = localStorage.getItem('userId'); 

    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!currentUser.value) {
            currentUser.value = parsedUser;
        }
        if (!userId && parsedUser.UserID) userId = parsedUser.UserID;
        else if (!userId && parsedUser.id) userId = parsedUser.id;
    }
    
    if (!userId) userId = 1; 

    try {
        const response = await axios.get(`http://localhost:5000/api/home-data/${userId}?t=${new Date().getTime()}`);
        
        meals.value = response.data.suggestedMeals || [];
        healthTips.value = response.data.healthTips || [];
        
        console.log("البيانات الحقيقية المستلمة بنجاح:", response.data);
    } catch (error) {
        console.error("Error fetching home data:", error);
    }
})

// 🛠️ دالة احتياطية ذكية تعطي صوراً فريدة ومطابقة لاسم الوجبة لحل مشكلة الاختفاء والروابط الفارغة في الداتابيس
function getMealFallbackImage(mealName) {
  if (!mealName) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500';
  
  const name = mealName.toLowerCase();
  if (name.includes('wrap')) return 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?q=80&w=500';
  if (name.includes('tart')) return 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=500';
  if (name.includes('bowl') || name.includes('yogurt')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500';
  if (name.includes('salad')) return 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=500';
  if (name.includes('salmon')) return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500';
  if (name.includes('toast')) return 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=500';
  if (name.includes('stew') || name.includes('beef')) return 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=500';
  if (name.includes('oatmeal')) return 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=500';
  if (name.includes('soup') || name.includes('lentil')) return 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?q=80&w=500';
  
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500';
}

function selectMeal(meal) {
    selectedMeal.value = meal
    showModal.value = true
}

async function chooseMeal(type) {
  let userId = localStorage.getItem('userId') || 1;
  try {
    await axios.post('http://localhost:5000/api/meal/add-suggested', {
      userId: userId,
      mealId: selectedMeal.value.id, 
      mealType: type,
      date: new Date().toISOString().split('T')[0]
    });
    
    alert(`Successfully added ${selectedMeal.value.temp_name} to your ${type}! 🎉`);
    showModal.value = false;
    window.location.reload();
  } catch (error) {
    console.error("Error adding meal:", error);
    alert("Failed to add meal. Please try again.");
  }
}
</script>
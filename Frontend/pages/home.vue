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
          class="bg-white p-10 rounded-xl shadow-md border border-gray-100"
        >
          <img 
            :src="meal.temp_image && meal.temp_image !== 'NULL' && meal.temp_image !== '' ? meal.temp_image : getMealFallbackImage(meal.temp_name)" 
            alt="meal" 
            class="rounded-lg w-full h-40 object-cover mb-4"
            @error="(e) => e.target.src = getMealFallbackImage(meal.temp_name)"
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
        
        <div class="flex items-start gap-3">
          <span class="text-xl">🌟</span>
          <p class="text-gray-700 text-lg leading-relaxed">Consistency is key! Every healthy choice you make today brings you closer to your goal.</p>
        </div>

        <div class="flex items-start gap-3 border-t pt-3 border-gray-100">
          <span class="text-xl">📊</span>
          <p class="text-gray-700 text-lg leading-relaxed">
            You have consumed <strong class="text-green-600">{{ consumedCalories }}</strong> calories. 
          </p>
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
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useState } from '#app' 

const currentUser = useState('currentUser') 

const meals = ref([])
const showModal = ref(false)
const selectedMeal = ref(null)
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"]

// المتغيرات الخاصة بالسعرات المستهلكة والهدف اليومي
const consumedCalories = ref(0)
const targetCalories = ref(2000) // قيمة افتراضية للهدف اليومي

// حساب السعرات المتبقية تلقائياً
const caloriesLeft = computed(() => {
  return targetCalories.value - consumedCalories.value
})

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
        // 1. جلب الاقتراحات العشوائية الستة لصفحة الهوم
        const homeResponse = await axios.get(`http://localhost:5000/api/home-data/${userId}?t=${new Date().getTime()}`);
        if (Array.isArray(homeResponse.data)) {
            meals.value = homeResponse.data;
        } else {
            meals.value = homeResponse.data.suggestedMeals || [];
        }

        // 2. ✨ الجزء الجديد: جلب الوجبات الفعلية للمستخدم لليوم الحالي لحساب السعرات التراكمية بشكل صحيح عند كل تحديث
        const todayMealsResponse = await axios.get(`http://localhost:5000/api/meal/today/${userId}?t=${new Date().getTime()}`);
        if (Array.isArray(todayMealsResponse.data)) {
            let total = 0;
            todayMealsResponse.data.forEach(meal => {
                // نجمع السعرات التراكمية للوجبة بناءً على المسميين اللذين أرسلهما الباك إند
                total += meal.totalCalories || meal.TotalCalories || 0;
            });
            consumedCalories.value = total;
        }

        // 3. محاولة تحديث قيمة الهدف اليومي من بيانات الجداول الأخرى كالمستخدم والتقدم إن وجدت
        const progressResponse = await axios.get(`http://localhost:5000/api/meal/progress/${userId}`);
        if (progressResponse.data && progressResponse.data.goals) {
             // يمكنك ربط الهدف من الداتابيس هنا إذا كان مسجلاً للمستخدم، أو الإبقاء على الـ 2000 الافتراضية
        }

    } catch (error) {
        console.error("Error fetching home or today meals data:", error);
    }
})

function selectMeal(meal) {
    selectedMeal.value = meal
    showModal.value = true
}

async function chooseMeal(type) {
  let userId = localStorage.getItem('userId') || 1;
  
  const targetFoodItemId = selectedMeal.value 
    ? (selectedMeal.value.id || selectedMeal.value.FoodItemID || selectedMeal.value.temp_id) 
    : null;

  console.log("Selected Meal Object:", selectedMeal.value);
  console.log("Extracted Food Item ID:", targetFoodItemId);

  if (!targetFoodItemId) {
    alert("Error: Food Item ID is missing or undefined in the selected meal.");
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/meal/add-suggested', {
      userId: userId,
      mealType: type,      
      foodItemId: targetFoodItemId
    });
    
    console.log("Server Response:", response.data);
    alert(`Successfully added ${selectedMeal.value.temp_name || 'Meal'} to your ${type}! 🎉`);
    showModal.value = false;
    
    // إعادة تحميل الصفحة لتحديث السعرات في دالة onMounted فوراً
    window.location.reload();

  } catch (error) {
    console.error("Error adding meal:", error);
    if (error.response && error.response.data) {
      alert(`Failed to add meal: ${error.response.data.error || error.response.data.message || 'Server Error'}`);
    } else {
      alert("Failed to add meal. Please check if your backend server is running.");
    }
  }
}

function getMealFallbackImage(mealName) {
  if (!mealName) return '/meals/default_meal1.jpg';
  const name = mealName.toLowerCase();
  
  if (name.includes('bakhmari') || name.includes('barwata')) return '/meals/bakery.jpg';
  if (name.includes('lakham') || name.includes('salmon') || name.includes('tuna') || name.includes('shrimp') || name.includes('cod') || name.includes('crab') || name.includes('fish') || name.includes('lobster') || name.includes('halibut') || name.includes('herring') || name.includes('mackerel') || name.includes('oyster') || name.includes('sardine') || name.includes('scallop') || name.includes('swordfish')) return '/meals/seafood.jpg';
  if (name.includes('milk') || name.includes('butter') || name.includes('cheese') || name.includes('yogurt') || name.includes('cream') || name.includes('egg') || name.includes('yolk') || name.includes('margarine')) return '/meals/dairy.jpg';
  if (name.includes('beef') || name.includes('steak') || name.includes('hamburger') || name.includes('bacon') || name.includes('chicken') || name.includes('turkey') || name.includes('lamb') || name.includes('lamp') || name.includes('duck') || name.includes('veal') || name.includes('roast') || name.includes('lard')) return '/meals/meat.jpg';
  if (name.includes('juice') || name.includes('coffee') || name.includes('tea') || name.includes('beer') || name.includes('wine') || name.includes('soda') || name.includes('lemonade') || name.includes('limeade') || name.includes('cocoa') || name.includes('carbona') || name.includes('club') || name.includes('cola') || name.includes('ginger') || name.includes('ale') || name.includes('root') || name.includes('flavo')) return '/meals/drinks.jpg';
  if (name.includes('bread') || name.includes('biscuit') || name.includes('waffles') || name.includes('rice') || name.includes('oatmeal') || name.includes('flour') || name.includes('noodle') || name.includes('spaghetti') || name.includes('macaroni') || name.includes('pizza') || name.includes('popcorn') || name.includes('cornflake') || name.includes('cracker') || name.includes('muffin') || name.includes('pancake') || name.includes('wheat') || name.includes('grain') || name.includes('roll')) return '/meals/bakery.jpg';
  if (name.includes('cake') || name.includes('cace') || name.includes('chocolate') || name.includes('cupcake') || name.includes('fudge') || name.includes('candy') || name.includes('marshmallow') || name.includes('sugar') || name.includes('pudding') || name.includes('ice cream') || name.includes('custard') || name.includes('mousse') || name.includes('betty') || name.includes('honey') || name.includes('molasses') || name.includes('syrup') || name.includes('doughnut') || name.includes('gelatin') || name.includes('jelly') || name.includes('pie') || name.includes('pi ') || name.includes('tapioca') || name.includes('ices')) return '/meals/sweets.jpg';
  if (name.includes('almond') || name.includes('cashew') || name.includes('peanut') || name.includes('walnut') || name.includes('oil') || name.includes('hydrogenated') || name.includes('safflower') || name.includes('dressing') || name.includes('pecan') || name.includes('coconut') || name.includes('sesame') || name.includes('sunflowe')) return '/meals/nuts.jpg';
  if (name.includes('broccoli') || name.includes('onion') || name.includes('potato') || name.includes('tomato') || name.includes('salad') || name.includes('bean') || name.includes('peas') || name.includes('carrot') || name.includes('soup') || name.includes('lentil') || name.includes('fried') || name.includes('mushroom') || name.includes('okra') || name.includes('spinach') || name.includes('lettuce') || name.includes('cabbage') || name.includes('corn') || name.includes('cucumber') || name.includes('eggplant') || name.includes('kale') || name.includes('radish') || name.includes('squash') || name.includes('bouillon') || name.includes('chowder')) return '/meals/vegetables.jpg';
  if (name.includes('apple') || name.includes('banana') || name.includes('avocado') || name.includes('date') || name.includes('orange') || name.includes('grape') || name.includes('peach') || name.includes('strawberry') || name.includes('apricot') || name.includes('berry') || name.includes('cherry') || name.includes('fig') || name.includes('olive') || name.includes('papaya') || name.includes('pear') || name.includes('pineapple') || name.includes('plum') || name.includes('prune') || name.includes('raisin') || name.includes('watercress') || name.includes('melon') || name.includes('turnip')) return '/meals/fruits.jpg';

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const imageNumber = (Math.abs(hash) % 5) + 1; 
  return `/meals/default_meal${imageNumber}.jpg`;
}
</script>
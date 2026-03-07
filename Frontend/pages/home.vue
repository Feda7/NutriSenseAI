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
      <h2 class="text-2xl font-bold text-green-700 mb-4">Personalized Health Tips For You ✨</h2>
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
import axios from 'axios' // تأكدي من تثبيت axios

const meals = ref([])
const healthTips = ref([])
const showModal = ref(false)
const selectedMeal = ref(null)
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"]

// جلب البيانات عند فتح الصفحة
onMounted(async () => {
    const userId = localStorage.getItem('userId'); // نفترض أنك تخزنين الأيدي عند تسجيل الدخول
    
    // 1. جلب الوجبات المقترحة
    const mealRes = await axios.get(`http://localhost:5000/api/meals/suggested/${userId}`);
    meals.value = mealRes.data;

    // 2. جلب النصائح الصحية (يمكنك عمل API خاص لها أو كتابة منطق بسيط هنا)
    fetchHealthTips(userId);
})

async function fetchHealthTips(userId) {
    // هنا نرسل طلب للباك اند يجلب نصائح بناءً على حالة المستخدم
    const tipRes = await axios.get(`http://localhost:5000/api/user/tips/${userId}`);
    healthTips.value = tipRes.data; 
    // مثال للنصيحة: "بما أنك تعاني من السكري 🍬، جرب استبدال السكر الأبيض بالعسل الطبيعي بكميات محدودة 🍯"
}

async function chooseMeal(type) {
    const userId = localStorage.getItem('userId');
    
    // إرسال الوجبة للباك اند لتضاف لجدول الوجبات اليومية للمستخدم
    try {
        await axios.post('http://localhost:5000/api/meal/add-suggested', {
            userId: userId,
            mealId: selectedMeal.value.id,
            mealType: type,
            date: new Date().toISOString().split('T')[0]
        });
        
        alert(`تمت إضافة ${selectedMeal.value.name} إلى وجبة ${type} بنجاح! 🎉`);
        showModal.value = false;
    } catch (error) {
        console.error("خطأ في الإضافة:", error);
    }
}
</script>

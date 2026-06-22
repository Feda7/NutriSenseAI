<template>
  <div class="space-y-8 px-6">
      <MealCard 
        title="Breakfast"
        :items="meals.breakfast"
        mealName="breakfast"
        :mealId="mealIds?.breakfast" 
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
        @refreshMeals="handleRefresh" 
      />

      <MealCard 
        title="Lunch"
        :items="meals.lunch"
        mealName="lunch"
        :mealId="mealIds?.lunch" 
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
        @refreshMeals="handleRefresh" 
      />

      <MealCard 
        title="Dinner"
        :items="meals.dinner"
        mealName="dinner"
        :mealId="mealIds?.dinner" 
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
        @refreshMeals="handleRefresh" 
      />

      <MealCard 
        title="Snacks"
        :items="meals.snacks"
        mealName="snacks"
        :mealId="mealIds?.snacks" 
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
        @refreshMeals="handleRefresh" 
      />
  </div>
</template>

<script setup>
import MealCard from "./MealCard.vue";

const props = defineProps({
  meals: {
    type: Object,
    required: true
  },
  // 🌟 تم التعديل: استقبلنا كائن الـ mealIds المرسل من صفحة food.vue الرئيسية لضمان وصول المعرفات للكروت
  mealIds: {
    type: Object,
    default: () => ({ breakfast: null, lunch: null, dinner: null, snacks: null })
  },
  dietType: {
    type: [String, Object, Number], 
    default: null
  },
  diseases: {
    type: Array,
    default: () => []
  }
});

// 🌟 تم التعديل: أضفنا refreshMeals للـ emits لكي تصل إشارة التحديث لصفحة food.vue الرئيسية وتنفذ fetchMeals()
const emit = defineEmits(["addFood", "uploadImage", "refreshMeals"]);

function addFood(meal, food) {
    emit("addFood", meal, food);
}

function uploadImage(meal, file) {
    emit("uploadImage", meal, file);
}

function handleRefresh() {
    emit("refreshMeals");
}
</script>
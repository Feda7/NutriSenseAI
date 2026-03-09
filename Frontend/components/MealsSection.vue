<template>
    <div class="space-y-8 px-6">
        <MealCard 
        title="Breakfast"
        mealName="breakfast"
        :items="meals.breakfast"
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
        />

        <MealCard 
        title="Lunch"
        mealName="lunch"
        :items="meals.lunch"
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
        />

        <MealCard 
        title="Dinner"
        mealName="dinner"
        :items="meals.dinner"
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
        />

        <MealCard 
        title="Snacks"
        mealName="snacks"
        :items="meals.snacks"
        :dietType="dietType"
        :diseases="diseases"
        @addFood="addFood"
        @uploadImage="uploadImage"
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
  dietType: {
    // التعديل هنا: أضفنا Number لكي يقبل القيمة 3 القادمة من قاعدة البيانات دون اعتراض
    type: [String, Object, Number], 
    default: null
  },
  diseases: {
    type: Array,
    default: () => []
  }
});
const emit = defineEmits(["addFood", "uploadImage"]);

function addFood(meal, food) {
    emit("addFood", meal, food);
}

function uploadImage(meal, file) {
    emit("uploadImage", meal, file);
}
</script>
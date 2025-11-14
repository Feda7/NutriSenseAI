<template>
    <div class="max-w-3xl mx-auto space-y-8">

        <MealCard
        title="Breakfast"
        :items="meals.breakfast"
        mealName="breakfast"
        @addFood="add"
        @uploadImage="upload"
        />

        <MealCard
        title="Lunch"
        :items="meals.lunch"
        mealName="lunch"
        @addFood="add"
        @uploadImage="upload"
        />

        <MealCard
        title="Dinner"
        :items="meals.dinner"
        mealName="dinner"
        @addFood="add"
        @uploadImage="upload"
        />

        <MealCard
        title="Snacks"
        :items="meals.snacks"
        mealName="snacks"
        @addFood="add"
        @uploadImage="upload"
        />

    </div>
</template>

<script setup>
const props = defineProps(['meals'])
const emit = defineEmits(['addFood', 'uploadImage'])

const add = (meal, food) => emit('addFood', meal, food)
const upload = (meal, img) => emit('uploadImage', meal, img)
</script>

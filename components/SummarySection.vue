<template>
    <div class="p-6 mx-auto items-center">
        <div>
            <h2 class="text-3xl font-bold text-green-600 mb-8">Today's Summary</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 ">
            <div class="bg-white shadow-md rounded-2xl p-6  text-center">
                <p class="text-gray-500 font-medium">Daily Calories</p>
                <p class="text-2xl font-bold text-green-600">{{ userCalories }}</p>
            </div>

            <div class="bg-white shadow-md rounded-2xl p-6 text-center">
                <p class="text-gray-500 font-medium">Consumed</p>
                <p class="text-2xl font-bold text-green-600">{{ consumed }}</p>
            </div>

            <div class="bg-white shadow-md rounded-2xl p-6 text-center">
                <p class="text-gray-500 font-medium">Remaining</p>
                <p class="text-2xl font-bold text-green-600">{{ remaining }}</p>
            </div>
        </div>
    
    </div>
</template>

<script setup>
defineProps(['userCalories', 'consumed', 'remaining'])
</script>


    
<template>
    <div class="bg-white shadow-md rounded-2xl p-6 max-w-3xl mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Today's Summary</h2>

        <div class="grid grid-cols-3 gap-6 text-center">

            <div class="bg-green-50 p-4 rounded-xl">
                <p class="text-gray-600">Daily Calories</p>
                <p class="text-2xl font-bold text-green-600">{{ userCalories }}</p>
            </div>

            <div class="bg-red-50 p-4 rounded-xl">
                <p class="text-gray-600">Consumed</p>
                <p class="text-2xl font-bold text-red-500">{{ consumed }}</p>
            </div>

            <div class="bg-blue-50 p-4 rounded-xl">
                <p class="text-gray-600">Remaining</p>
                <p class="text-2xl font-bold text-blue-600">{{ remaining }}</p>
            </div>

        </div>
    </div>
</template>

<script setup>
defineProps(['userCalories', 'consumed', 'remaining'])
</script>

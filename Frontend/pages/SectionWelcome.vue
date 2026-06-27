<template>
  <div class="w-full bg-gray-50 font-sans pt-12 md:px-4 pb-0">
    <section class="bg-white w-full h-full shadow-md rounded-2xl py-10 ">
    <h1 class="text-3xl font-bold text-green-600 mb-4 text-center pb-2 pt-10">Welcome to NutriSenseAI</h1>
    <p class="text-gray-600 mb-8 text-center">Your smart nutrition companion for a healthier life.</p>

    <div class="grid md:grid-cols-3 gap-5 mb-18 px-10">
      <div>
        <img src="/public/images/Track your nutrition with ease.png" class="rounded-xl mb-2 object-cover" />
        <p class="text-sm text-gray-700 flex justify-center">Track your nutrition with ease.</p>
      </div>
      <div>
        <img src="/public/images/Discover your diet insights.png" class="rounded-xl mb-2 object-cover" />
        <p class="text-sm text-gray-700 flex justify-center">Discover your diet insights.</p>
      </div>
      <div>
        <img src="/public/images/Build better eating habits.png" class="rounded-xl mb-2 object-cover" />
        <p class="text-sm text-gray-700 flex justify-center">Build better eating habits.</p>
      </div>
    </div>

    <div class="flex items-center justify-center mt-16">
      <button
      class=" bg-green-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-700 transition-all "
      
    >
    <NuxtLink to="/register"> Continue</NuxtLink>
      
    </button>
    </div>
    </section>
  </div>
  
</template>
<script setup>
</script>
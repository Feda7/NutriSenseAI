<template>
  <div class="w-full  bg-gray-50 font-sans py-12 px-4 ">
    <section class="bg-white w-full shadow-md rounded-2xl h-[500px] ">
    <h1 class="text-3xl font-bold text-green-600 mb-4 text-center py-2 ">Welcome to NutriSenseAI</h1>
    <p class="text-gray-600 mb-8 text-center">Your smart nutrition companion for a healthier life.</p>

    <div class="grid grid-cols-3 gap-4 mb-18 px-10">
      <div>
        <img src="" class="rounded-xl mb-2 w-full h-40 object-cover" />
        <p class="text-sm text-gray-700 flex justify-center">Track your nutrition with ease.</p>
      </div>
      <div>
        <img src="" class="rounded-xl mb-2 w-full h-40 object-cover" />
        <p class="text-sm text-gray-700 flex justify-center">Discover your diet insights.</p>
      </div>
      <div>
        <img src="" class="rounded-xl mb-2 w-full h-40 object-cover" />
        <p class="text-sm text-gray-700 flex justify-center">Build better eating habits.</p>
      </div>
    </div>

    <div class="flex items-center justify-center mt-16">
      <button
      @click="$emit('next')"
      class=" bg-green-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-700 transition-all "
      
    >
    <NuxtLink to="/Account"> Continue</NuxtLink>
      
    </button>
    </div>
    </section>
  </div>
  
</template>
<script setup>
</script>
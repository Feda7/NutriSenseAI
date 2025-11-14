<template>

   
     <!-- Hero Section -->  <!--S1-->
        <section class="bg-white w-full shadow-md rounded-2xl">
        <div class="max-w-7xl mx-auto px-6 py-20 flex flex-col-reverse lg:flex-row items-center justify-between">
            
            <!-- Hero Text -->
            <div class="lg:w-1/2 text-center lg:text-left">
            <h1 class="text-4xl md:text-5xl font-bold text-green-600 mb-6">
                NutriSenseAI
            </h1>
            <p class="text-gray-700 text-lg md:text-xl mb-8">
                Track your meals, optimize your nutrition, and achieve your health goals with AI-powered insights.
            </p>
            <div class="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <button class="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all">
               
                <NuxtLink to="/SectionWelcome"> Get Started</NuxtLink>
                </button>
                
            </div>
            </div>

            <!-- Hero Image -->
            <div class="lg:w-1/2 mb-10 lg:mb-0 flex justify-center">
            <img src="https://via.placeholder.com/500x400.png?text=NutriSenseAI" alt="NutriSenseAI Hero" class="rounded-2xl shadow-lg" />
            </div>
        </div>
        </section>
   
</template>
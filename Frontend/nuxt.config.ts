export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      // الكود هنا ذكي: سيحاول عرفة أين يعمل الموقع
      apiBase: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://nutrisenseai.onrender.com'
    },
  }
})
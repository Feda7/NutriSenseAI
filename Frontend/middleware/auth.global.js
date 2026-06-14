export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    // التعديل هنا ليقرأ من الـ sessionStorage بدلاً من الـ localStorage
    const token = sessionStorage.getItem('adminToken')

    if (!token && to.path.startsWith('/admin') && to.path !== '/admin/login') {
      return navigateTo('/admin/login')
    }
  }
})
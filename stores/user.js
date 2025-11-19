import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userData: {}   // هنا تتجمع بيانات المستخدم كلها

  actions: {
    setUserData(data) {
      this.userData = { ...this.userData, ...data }
    }
  }
})

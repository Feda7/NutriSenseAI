// composables/useAuth.js
import { reactive } from 'vue'

export const useAuth = () => {
  const state = reactive({
    isLoggedIn: false // false بشكل افتراضي
  })

  const login = () => state.isLoggedIn = true
  const logout = () => state.isLoggedIn = false

  return { state, login, logout }
}

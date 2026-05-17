import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref({
        name: 'Studente',
        email: '',
        avatar: null
    })

    const isAuthenticated = computed(() => true)

    function logout() { }

    return { user, isAuthenticated, logout }
})
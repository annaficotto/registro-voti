import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const selectedPeriod = ref('all') // 'all' | 'Q1' | 'Q2'

    function setPeriod(p) {
        selectedPeriod.value = p
    }

    return { selectedPeriod, setPeriod }
})
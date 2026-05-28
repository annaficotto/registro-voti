import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api'
axios.defaults.withCredentials = true

export const useGradesStore = defineStore('grades', () => {
    const subjects = ref([])
    const grades = ref([])
    const settings = ref({
        targetAverage: 8.0,
        schoolYear: '2025-2026',
        class: '4IC',
        year: 4
    })
    const loading = ref(false)
    const activePeriod = ref('all') // 'all' | 'Q1' | 'Q2'

    async function loadData() {
        loading.value = true
        try {
            const res = await axios.get(`${API}/data`)
            subjects.value = res.data.subjects || []
            grades.value = res.data.grades || []
            settings.value = { ...settings.value, ...res.data.settings }
        } catch (e) {
            console.error('Errore caricamento dati:', e)
        } finally {
            loading.value = false
        }
    }

    async function addGrade(gradeData) {
        const res = await axios.post(`${API}/grades`, gradeData)
        grades.value.push(res.data)
    }

    async function updateGrade(id, gradeData) {
        const res = await axios.put(`${API}/grades/${id}`, gradeData)
        const idx = grades.value.findIndex(g => g.id === id)
        if (idx !== -1) grades.value[idx] = res.data
    }

    async function deleteGrade(id) {
        await axios.delete(`${API}/grades/${id}`)
        grades.value = grades.value.filter(g => g.id !== id)
    }

    async function addSubject(subjectData) {
        const res = await axios.post(`${API}/subjects`, subjectData)
        subjects.value.push(res.data)
    }

    async function deleteSubject(id) {
        await axios.delete(`${API}/subjects/${id}`)
        subjects.value = subjects.value.filter(s => s.id !== id)
        grades.value = grades.value.filter(g => g.subjectId !== id)
    }

    async function saveSettings(newSettings) {
        await axios.put(`${API}/settings`, newSettings)
        settings.value = { ...settings.value, ...newSettings }
    }

    async function updateSubject(id, data) {
        const res = await axios.put(`${API}/subjects/${id}`, data)
        const idx = subjects.value.findIndex(s => s.id === id)
        if (idx !== -1) subjects.value[idx] = { ...subjects.value[idx], ...res.data }
    }

    return {
        subjects, grades, settings, loading, activePeriod,
        loadData, addGrade, updateGrade, deleteGrade,
        addSubject, updateSubject, deleteSubject, saveSettings
    }
})
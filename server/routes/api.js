import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()
const DATA_FILE = path.join(__dirname, '../data/data.json')

function getData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initial = {
            settings: {
                targetAverage: 8.0,
                schoolYear: '2025-2026',
                class: ''
            },
            subjects: [],
            grades: []
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2))
        return initial
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

function makeId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// Tutti i dati
router.get('/data', (req, res) => {
    res.json(getData())
})

// Impostazioni
router.put('/settings', (req, res) => {
    const data = getData()
    data.settings = { ...data.settings, ...req.body }
    saveData(data)
    res.json(data.settings)
})

// Materie
router.post('/subjects', (req, res) => {
    const data = getData()
    const subject = { id: `sub_${makeId()}`, ...req.body }
    data.subjects.push(subject)
    saveData(data)
    res.json(subject)
})

router.put('/subjects/:id', (req, res) => {
    const data = getData()
    const idx = data.subjects.findIndex(s => s.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Materia non trovata' })
    data.subjects[idx] = { ...data.subjects[idx], ...req.body }
    saveData(data)
    res.json(data.subjects[idx])
})

router.delete('/subjects/:id', (req, res) => {
    const data = getData()
    data.subjects = data.subjects.filter(s => s.id !== req.params.id)
    data.grades = data.grades.filter(g => g.subjectId !== req.params.id)
    saveData(data)
    res.json({ ok: true })
})

// Voti
router.post('/grades', (req, res) => {
    const data = getData()
    const grade = {
        id: `g_${makeId()}`,
        ...req.body,
        createdAt: new Date().toISOString()
    }
    data.grades.push(grade)
    saveData(data)
    res.json(grade)
})

router.put('/grades/:id', (req, res) => {
    const data = getData()
    const idx = data.grades.findIndex(g => g.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Voto non trovato' })
    data.grades[idx] = { ...data.grades[idx], ...req.body }
    saveData(data)
    res.json(data.grades[idx])
})

router.delete('/grades/:id', (req, res) => {
    const data = getData()
    data.grades = data.grades.filter(g => g.id !== req.params.id)
    saveData(data)
    res.json({ ok: true })
})

export default router
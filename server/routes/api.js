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

// Importazione voti da immagine via AI
router.post('/ai/import', async (req, res) => {
    const { imageBase64, mimeType } = req.body

    if (!imageBase64) {
        return res.status(400).json({ error: 'Immagine mancante' })
    }

    if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'API key OpenRouter non configurata nel server' })
    }

    const data = getData()
    const subjectList = data.subjects.map(s => `- id: "${s.id}", nome: "${s.name}"`).join('\n')

    const prompt = `Sei un assistente che estrae voti scolastici da immagini.

Analizza l'immagine e restituisci SOLO un JSON valido (nessun testo prima o dopo) con questa struttura:
{
  "grades": [
    {
      "subjectId": "id della materia corrispondente dalla lista sotto, o null se non trovata",
      "subjectNameFound": "nome della materia come appare nell'immagine",
      "value": numero tra 1 e 10 (usa decimali come 7.5 se necessario),
      "type": "scritto" | "orale" | "pratico",
      "date": "YYYY-MM-DD o null se non trovata",
      "note": "eventuale descrizione della verifica o null"
    }
  ]
}

Materie disponibili nel registro:
${subjectList || '(nessuna materia ancora inserita)'}

Regole:
- Estrai tutti i voti visibili nell'immagine
- I voti possono essere scritti come numeri (7, 8.5), frazioni (15/20 → converti in decimi), lettere (A=9, B=8, C=7, D=6, E=5) o descrizioni
- Se una materia nell'immagine corrisponde a una della lista, usa il suo id
- Se non corrisponde a nessuna, metti subjectId: null
- Se il tipo (scritto/orale/pratico) non è specificato, usa "scritto"
- Restituisci SOLO il JSON, nessun altro testo`

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:5173',
                'X-OpenRouter-Title': 'Registro Voti'
            },
            body: JSON.stringify({
                model: 'google/gemma-4-26b-a4b-it:free',
                max_tokens: 2000,
                temperature: 0.1,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
                                }
                            },
                            {
                                type: 'text',
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        })

        const aiData = await response.json()

        if (!response.ok) {
            console.error('OpenRouter error:', aiData)
            const code = aiData.error?.code
            if (code === 429) {
                return res.status(429).json({
                    error: 'Il modello AI è temporaneamente sovraccarico. Aspetta 30 secondi e riprova.'
                })
            }
            return res.status(500).json({ error: aiData.error?.message || 'Errore API OpenRouter' })
        }

        const content = aiData.choices?.[0]?.message?.content
        if (!content) {
            return res.status(500).json({ error: 'Risposta AI vuota' })
        }

        let parsed
        try {
            parsed = JSON.parse(content)
        } catch {
            return res.status(500).json({ error: 'Risposta AI non è JSON valido', raw: content })
        }

        res.json({ grades: parsed.grades || [] })

    } catch (err) {
        console.error('Errore chiamata AI:', err)
        res.status(500).json({ error: 'Errore di rete verso OpenRouter' })
    }
})

export default router
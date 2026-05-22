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
    const schoolYear = data.settings.schoolYear || '2025/2026'
    const [startYear, endYear] = schoolYear.split('-').map(Number)
    // startYear = 2025, endYear = 2026

    const subjectList = data.subjects.map(s => `- id: "${s.id}", nome: "${s.name}"`).join('\n')

    // Mappa alias per materie (chiave: stringa da cercare, valore: nome canonico nel registro)
    const subjectAliasMap = {
        'tecnologie e progettazione di sistemi informatici e di': 'TPSIT',
        'telecomunicazioni': 'Telecomunicazioni'
    }

    function normalizeSubjectName(name) {
        if (!name) return ''
        const lower = name.toLowerCase().trim()
        for (const [alias, canonical] of Object.entries(subjectAliasMap)) {
            if (lower.includes(alias.toLowerCase())) return canonical
        }
        return name
    }

    function convertDate(dateStr) {
        if (!dateStr) return null
        // Se è già YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
        // Se è DD/MM
        const match = dateStr.match(/^(\d{2})\/(\d{2})$/)
        if (match) {
            const day = match[1]
            const month = match[2]
            const year = (parseInt(month, 10) >= 9) ? startYear : endYear
            return `${year}-${month}-${day}`
        }
        return null
    }

    function getPeriodFromDate(dateStr) {
        if (!dateStr) return 'Q1'
        const month = new Date(dateStr).getMonth() + 1
        return (month >= 9 && month <= 12) ? 'Q1' : 'Q2'
    }

    const prompt = `Sei un assistente che estrae voti scolastici da immagini di registri elettronici italiani.

Analizza l'immagine e restituisci SOLO un JSON valido (nessun testo prima o dopo) con questa struttura:
{
  "grades": [
    {
      "subjectId": "id della materia corrispondente dalla lista sotto, o null se non trovata",
      "subjectNameFound": "nome della materia come appare nell'immagine",
      "value": numero decimale tra 1 e 10,
      "type": "scritto" | "orale" | "pratico",
      "date": "DD/MM (es. 15/10) se visibile, altrimenti null",
      "note": "eventuale descrizione della verifica o null"
    }
  ]
}

Materie disponibili nel registro:
${subjectList || '(nessuna materia ancora inserita)'}

=== TIPOLOGIA SELEZIONATA ===
Nell'interfaccia è attivo un filtro per tipologia (es. "Scritto/Grafico", "Orale", "Pratico", "Tutto").
Guarda quale pulsante è evidenziato/selezionato (solitamente con sfondo colorato rispetto agli altri).
- Se il filtro attivo è "Scritto/Grafico" → assegna type: "scritto" a tutti i voti estratti
- Se il filtro attivo è "Orale" → assegna type: "orale" a tutti i voti estratti
- Se il filtro attivo è "Pratico" → assegna type: "pratico" a tutti i voti estratti
- Se il filtro attivo è "Tutto" → determina il tipo voto per voto se deducibile, altrimenti usa "scritto"

=== CONVERSIONE DEI VOTI (sistema italiano) ===
Converti sempre il voto in un numero decimale seguendo queste regole precise:

  Notazione      | Valore  | Spiegazione
  ---------------|---------|-------------------------
  7              | 7.0     | voto intero
  7+             | 7.25    | più un quarto
  7½             | 7.5     | più mezzo
  7/8            | 7.75    | tra 7 e 8 (tre quarti)
  8-             | 7.85    | meno (quasi l'intero superiore)
  9/10           | 9.75    | tra 9 e 10

Applica lo stesso schema per qualsiasi voto (es. 6/7=6.75, 5+=5.25, 9½=9.5, ecc.)

=== DATE ===
Ogni voto ha la propria data scritta SOPRA il riquadro, in formato GG/MM (es. "24/04").
Leggi attentamente la data associata a ciascun voto individualmente: quando una materia ha più voti
affiancati, ogni data è posizionata sopra il voto corrispondente. Non confondere le date tra voti diversi.
Restituisci la data nel formato "DD/MM".

=== MATERIE SPECIALI ===
- "tecnologie e progettazione di sistemi informatici e di" (anche se troncata) → cerca corrispondenza con "TPSIT" nella lista materie
- "telecomunicazioni" → cerca corrispondenza con "Telecomunicazioni" nella lista materie
- In generale, abbina nomi lunghi o troncati alla materia più plausibile nella lista

=== REGOLE GENERALI ===
- Estrai TUTTI i voti visibili
- Se una materia non è nella lista, usa subjectId: null
- Restituisci SOLO il JSON, nessun altro testo, nessun markdown`

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

        // Arricchisci i voti con data convertita, periodo e associazione materia
        const enrichedGrades = (parsed.grades || []).map(grade => {
            // 1. Data
            let finalDate = convertDate(grade.date)
            if (!finalDate) {
                finalDate = new Date().toISOString().split('T')[0] // fallback a oggi
            }

            // 2. Periodo
            const period = getPeriodFromDate(finalDate)

            // 3. Materia: se subjectId è null, proviamo a matchare per nome (con alias)
            let subjectId = grade.subjectId
            if (!subjectId && grade.subjectNameFound) {
                const normalized = normalizeSubjectName(grade.subjectNameFound)
                const foundSubject = data.subjects.find(s =>
                    s.name.toLowerCase() === normalized.toLowerCase()
                )
                if (foundSubject) subjectId = foundSubject.id
            }

            return {
                ...grade,
                subjectId: subjectId || null,
                date: finalDate,
                period,
                value: parseFloat(grade.value) || null
            }
        })

        res.json({ grades: enrichedGrades })

    } catch (err) {
        console.error('Errore chiamata AI:', err)
        res.status(500).json({ error: 'Errore di rete verso OpenRouter' })
    }
})

export default router
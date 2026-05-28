import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.js'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true
}))
app.use(express.json({ limit: '20mb' }))

app.use('/api', apiRoutes)

// Servi la build del frontend
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

// Tutte le route non-API mandano index.html (SPA)
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server avviato su http://localhost:${PORT}`)
})
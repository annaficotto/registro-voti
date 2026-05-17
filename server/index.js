import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.js'

dotenv.config()

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())

app.use('/api', apiRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`✅ Server avviato su http://localhost:${PORT}`)
})
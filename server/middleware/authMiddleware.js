import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export default function authMiddleware(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ error: 'Non autenticato' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next()
    } catch {
        return res.status(401).json({ error: 'Token non valido' })
    }
}
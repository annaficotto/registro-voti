import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()
const DATA_DIR = path.join(__dirname, '../data/users')

function getUserFile(userId) {
    return path.join(DATA_DIR, `${userId}.json`)
}

function getUser(userId) {
    const file = getUserFile(userId)
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function saveUser(userId, data) {
    fs.writeFileSync(getUserFile(userId), JSON.stringify(data, null, 2))
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    const userId = profile.id
    let user = getUser(userId)

    if (!user) {
        user = {
            userId,
            profile: {
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                createdAt: new Date().toISOString()
            },
            settings: {
                targetAverage: 8.0,
                schoolYear: '2025-2026',
                class: ''
            },
            subjects: [],
            grades: []
        }
        saveUser(userId, user)
    }

    return done(null, { userId, profile: user.profile })
}))

router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
)

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: 'http://localhost:5173/login'
    }),
    (req, res) => {
        const token = jwt.sign(
            { userId: req.user.userId },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        )
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
        res.redirect('http://localhost:5173/dashboard')
    }
)

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.json({ ok: true })
})

export { passport }
export default router
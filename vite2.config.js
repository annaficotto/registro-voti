import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // dice al plugin di aggiungere automaticamente i tag delle icone nell'index.html della build
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      // Parte 1: Il Manifest (Generato dinamicamente da Vite)
      manifest: {
        name: 'Sapore Digitale',
        short_name: 'Sapore Digitale',
        description: 'Il tuo ricettario digitale moderno e minimale.',
        start_url: '/', // <-- FONDAMENTALE: Risolve l'errore "start_url is not valid"
        display: 'standalone',
        background_color: '#f4f4f4', // Colore di sfondo del caricamento (pari al tuo body CSS)
        theme_color: '#ff4a4a',       // Il rosso primario della tua app (#ff4a4a)
        orientation: 'portrait',
        icons: [
          {
            // Nota: assicurati che queste icone si trovino dentro la cartella "public/images/"
            src: 'images/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'images/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      // Parte 2: Service Worker (per il funzionamento offline)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'], 
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.themealdb\.com\/api\/json\/v1\/1\/.*/i,
            handler: 'NetworkFirst', 
            options: {
              cacheName: 'api-recipes-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 
              },
              cacheableResponse: {
                statuses: [0, 200] 
              }
            }
          }
        ]
      }
    })
  ]
})
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'
import 'bulma/css/bulma.min.css'
import './style.css'

const app = createApp(App)
const updateSW = registerSW({
    onNeedRefresh() {
        // Mostra notifica per aggiornamento disponibile
        console.log('Nuovo contenuto disponibile!')
    },
    onOfflineReady() {
        console.log('App pronta per funzionare offline')
    },
    onRegistered(registration) {
        console.log('Service Worker registrato:', registration)
    },
    onRegisterError(error) {
        console.error('Errore registrazione Service Worker:', error)
    }
})
app.use(createPinia())
app.use(router)
app.mount('#app')
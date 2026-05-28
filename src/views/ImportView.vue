<template>
    <div>
        <AppNavbar />
        <section class="section">
            <div class="container is-narrow">

                <h2 class="title">
                    <span class="icon mr-2"><i class="fas fa-wand-magic-sparkles"></i></span>
                    Importa voti da immagine
                </h2>
                <p class="subtitle is-6 has-text-grey mb-5">
                    Carica uno screenshot del tuo registro o pagella — l'AI riconoscerà i voti automaticamente
                </p>

                <!-- Step 1: carica immagine -->
                <div class="box mb-4" v-if="step === 1">
                    <h2 class="title is-5 mb-4">
                        <span class="tag is-primary mr-2">1</span>
                        Carica l'immagine
                    </h2>

                    <div class="upload-area" :class="{ 'is-dragover': isDragging }"
                        @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop"
                        @click="$refs.fileInput.click()">
                        <input ref="fileInput" type="file" accept="image/*" style="display: none"
                            @change="onFileSelected" />
                        <div v-if="!previewUrl" class="upload-placeholder">
                            <span class="icon is-large has-text-grey">
                                <i class="fas fa-cloud-arrow-up fa-2x"></i>
                            </span>
                            <p class="mt-3 has-text-grey">Trascina un'immagine qui oppure clicca per selezionarla</p>
                            <p class="is-size-7 has-text-grey mt-1">JPG, PNG, WEBP — max 10MB</p>
                        </div>
                        <div v-else class="preview-container">
                            <img :src="previewUrl" alt="Anteprima" class="preview-img" />
                            <button class="button is-small is-light mt-3" @click.stop="resetImage">
                                <span class="icon"><i class="fas fa-rotate-left"></i></span>
                                <span>Cambia immagine</span>
                            </button>
                        </div>
                    </div>

                    <div class="mt-4">
                        <button class="button is-primary is-fullwidth" :disabled="!imageBase64 || loading"
                            @click="analyzeImage">
                            <span class="icon" v-if="!loading"><i class="fas fa-magnifying-glass"></i></span>
                            <span class="icon" v-else><i class="fas fa-spinner fa-spin"></i></span>
                            <span>{{ loading ? 'Analisi in corso...' : 'Analizza immagine' }}</span>
                        </button>
                    </div>

                    <div class="notification is-danger is-light mt-3" v-if="error">
                        <span class="icon"><i class="fas fa-triangle-exclamation"></i></span>
                        {{ error }}
                    </div>

                    <!-- Inserimento manuale in caso di errore AI -->
                    <div v-if="showManualInput" class="mt-4">
                        <div class="is-flex is-align-items-center is-justify-content-space-between mb-3">
                            <p class="has-text-grey is-size-7">
                                <span class="icon"><i class="fas fa-pen"></i></span>
                                Inserisci i voti manualmente
                            </p>
                            <button class="button is-small is-light" @click="addManualRow">
                                <span class="icon"><i class="fas fa-plus"></i></span>
                                <span>Aggiungi riga</span>
                            </button>
                        </div>

                        <div class="table-container">
                            <table class="table is-fullwidth is-size-7">
                                <thead>
                                    <tr>
                                        <th>Materia</th>
                                        <th>Voto</th>
                                        <th>Tipo</th>
                                        <th>Data</th>
                                        <th>Note</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(grade, idx) in recognizedGrades" :key="idx"
                                        :class="{ 'has-background-warning-light': !grade.subjectId }">
                                        <td>
                                            <div class="select is-small is-fullwidth">
                                                <select v-model="grade.subjectId">
                                                    <option value="" disabled>Seleziona...</option>
                                                    <option v-for="sub in sortedSubjects" :key="sub.id" :value="sub.id">
                                                        {{ sub.name }}
                                                    </option>
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            <input class="input is-small has-text-centered" style="width: 70px"
                                                type="number" min="1" max="10" step="0.25"
                                                v-model.number="grade.value" />
                                        </td>
                                        <td>
                                            <div class="select is-small">
                                                <select v-model="grade.type">
                                                    <option value="scritto">Scritto</option>
                                                    <option value="orale">Orale</option>
                                                    <option value="pratico">Pratico</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            <input class="input is-small" style="width: 140px" type="date"
                                                v-model="grade.date" />
                                        </td>
                                        <td>
                                            <input class="input is-small" style="min-width: 120px" type="text"
                                                v-model="grade.note" placeholder="opzionale" />
                                        </td>
                                        <td>
                                            <button class="button is-small is-danger is-light"
                                                @click="recognizedGrades.splice(idx, 1)">
                                                <span class="icon"><i class="fas fa-xmark"></i></span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="!recognizedGrades.length">
                                        <td colspan="6" class="has-text-centered has-text-grey py-3">
                                            Nessun voto — clicca "Aggiungi riga" per iniziare
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="is-flex is-justify-content-flex-end mt-3">
                            <button class="button is-success" :disabled="!canImport || importing" @click="importGrades">
                                <span class="icon" v-if="!importing"><i class="fas fa-check"></i></span>
                                <span class="icon" v-else><i class="fas fa-spinner fa-spin"></i></span>
                                <span>{{ importing ? 'Importazione...' : `Importa ${recognizedGrades.length} voti`
                                }}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Step 2: revisione voti riconosciuti -->
                <div class="box" v-if="step === 2">
                    <h2 class="title is-5 mb-2">
                        <span class="tag is-primary mr-2">2</span>
                        Rivedi i voti riconosciuti
                    </h2>
                    <p class="has-text-grey is-size-7 mb-4">
                        Controlla che i voti siano corretti, assegna le materie mancanti e rimuovi quelli errati prima
                        di importare.
                    </p>

                    <div v-if="!recognizedGrades.length" class="has-text-centered py-5 has-text-grey">
                        <span class="icon is-large"><i class="fas fa-face-frown fa-2x"></i></span>
                        <p class="mt-2">Nessun voto riconosciuto nell'immagine. Prova con un'immagine più chiara.</p>
                    </div>

                    <table v-else class="table is-fullwidth">
                        <thead>
                            <tr>
                                <th>Materia trovata</th>
                                <th>Materia nel registro</th>
                                <th>Voto</th>
                                <th>Tipo</th>
                                <th>Data</th>
                                <th>Note</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(grade, idx) in recognizedGrades" :key="idx"
                                :class="{ 'has-background-warning-light': !grade.subjectId }">
                                <!-- Materia trovata nell'immagine -->
                                <td class="is-size-7 has-text-grey is-italic">
                                    {{ grade.subjectNameFound || '—' }}
                                </td>

                                <!-- Materia da associare -->
                                <td>
                                    <div class="select is-small is-fullwidth">
                                        <select v-model="grade.subjectId">
                                            <option value="" disabled>Seleziona...</option>
                                            <option v-for="sub in sortedSubjects" :key="sub.id" :value="sub.id">
                                                {{ sub.name }}
                                            </option>
                                        </select>
                                    </div>
                                </td>

                                <!-- Voto -->
                                <td>
                                    <input class="input is-small has-text-centered" style="width: 70px" type="number"
                                        min="1" max="10" step="0.25" v-model.number="grade.value" />
                                </td>

                                <!-- Tipo -->
                                <td>
                                    <div class="select is-small">
                                        <select v-model="grade.type">
                                            <option value="scritto">Scritto</option>
                                            <option value="orale">Orale</option>
                                            <option value="pratico">Pratico</option>
                                        </select>
                                    </div>
                                </td>

                                <!-- Data -->
                                <td>
                                    <input class="input is-small" style="width: 140px" type="date"
                                        v-model="grade.date" />
                                </td>

                                <!-- Note -->
                                <td>
                                    <input class="input is-small" style="min-width: 120px" type="text"
                                        v-model="grade.note" placeholder="opzionale" />
                                </td>

                                <!-- Elimina riga -->
                                <td>
                                    <button class="button is-small is-danger is-light"
                                        @click="recognizedGrades.splice(idx, 1)">
                                        <span class="icon"><i class="fas fa-xmark"></i></span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="notification is-warning is-light mt-3" v-if="error">
                        <span class="icon"><i class="fas fa-triangle-exclamation"></i></span>
                        {{ error }}
                        <button class="button is-small is-warning ml-3" @click="analyzeImage">
                            <span class="icon"><i class="fas fa-rotate-right"></i></span>
                            <span>Riprova ora</span>
                        </button>
                    </div>

                    <!-- Bottoni -->
                    <div class="is-flex is-justify-content-space-between mt-4">
                        <button class="button is-light" @click="backToStep1">
                            <span class="icon"><i class="fas fa-arrow-left"></i></span>
                            <span>Indietro</span>
                        </button>
                        <button class="button is-success" :disabled="!canImport || importing" @click="importGrades">
                            <span class="icon" v-if="!importing"><i class="fas fa-check"></i></span>
                            <span class="icon" v-else><i class="fas fa-spinner fa-spin"></i></span>
                            <span>{{ importing ? 'Importazione...' : `Importa ${recognizedGrades.length} voti` }}</span>
                        </button>
                    </div>
                </div>

                <!-- Step 3: successo -->
                <div class="box has-text-centered py-6" v-if="step === 3">
                    <span class="icon is-large has-text-success">
                        <i class="fas fa-check-double fa-3x"></i>
                    </span>
                    <h2 class="title is-4 mt-4">Importazione completata!</h2>
                    <p class="has-text-grey mb-5">
                        {{ importedCount }} voti aggiunti al registro con successo.
                    </p>
                    <div class="buttons is-centered">
                        <router-link to="/dashboard" class="button is-primary">
                            <span class="icon"><i class="fas fa-house"></i></span>
                            <span>Vai alla Dashboard</span>
                        </router-link>
                        <button class="button is-light" @click="resetAll">
                            <span class="icon"><i class="fas fa-plus"></i></span>
                            <span>Importa altri voti</span>
                        </button>
                    </div>
                </div>

            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGradesStore } from '@/stores/grades'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import axios from 'axios'

const store = useGradesStore()

const step = ref(1)
const loading = ref(false)
const importing = ref(false)
const error = ref('')
const previewUrl = ref(null)
const imageBase64 = ref(null)
const imageMimeType = ref('image/jpeg')
const isDragging = ref(false)
const recognizedGrades = ref([])
const importedCount = ref(0)
const showManualInput = ref(false)

const sortedSubjects = computed(() =>
    [...store.subjects].sort((a, b) => a.name.localeCompare(b.name))
)

const canImport = computed(() =>
    recognizedGrades.value.length > 0 &&
    recognizedGrades.value.every(g => g.subjectId)
)

function onFileSelected(e) {
    const file = e.target.files[0]
    if (file) loadFile(file)
}

function onDrop(e) {
    isDragging.value = false
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) loadFile(file)
}

function loadFile(file) {
    if (file.size > 10 * 1024 * 1024) {
        error.value = 'Immagine troppo grande (max 10MB)'
        return
    }
    imageMimeType.value = file.type
    const reader = new FileReader()
    reader.onload = (e) => {
        const result = e.target.result
        previewUrl.value = result
        imageBase64.value = result.split(',')[1]
    }
    reader.readAsDataURL(file)
}

function resetImage() {
    previewUrl.value = null
    imageBase64.value = null
    error.value = ''
}

async function analyzeImage() {
    error.value = ''
    loading.value = true
    showManualInput.value = false
    try {
        const res = await axios.post(
            (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/ai/import',
            { imageBase64: imageBase64.value, mimeType: imageMimeType.value }
        )

        recognizedGrades.value = (res.data.grades || []).map(g => ({
            subjectId: g.subjectId || '',
            subjectNameFound: g.subjectNameFound || '',
            value: g.value,
            type: g.type || 'scritto',
            date: g.date,
            period: g.period,
            note: g.note || ''
        }))

        step.value = 2
    } catch (e) {
        if (e.response?.status === 429) {
            const raw = e.response?.data?.error?.metadata?.raw || ''
            const isTemporary = raw.includes('temporarily rate-limited') || raw.includes('retry shortly')

            if (isTemporary) {
                error.value = '⏳ Modello sovraccarico, riprova tra qualche secondo.'
            } else {
                error.value = '❌ Limite giornaliero AI raggiunto. Riprova domani.'
            }
        } else {
            error.value = e.response?.data?.error || 'Errore durante l\'analisi. Riprova.'
        }
        showManualInput.value = true  // mostra inserimento manuale in caso di qualsiasi errore
    } finally {
        loading.value = false
    }
}

async function importGrades() {
    importing.value = true
    try {
        for (const grade of recognizedGrades.value) {
            await store.addGrade({
                subjectId: grade.subjectId,
                value: grade.value,
                type: grade.type,
                date: grade.date,
                period: grade.period,
                note: grade.note
            })
        }
        importedCount.value = recognizedGrades.value.length
        step.value = 3
    } catch {
        error.value = 'Errore durante l\'importazione. Riprova.'
    } finally {
        importing.value = false
    }
}


function addManualRow() {
    recognizedGrades.value.push({
        subjectId: '',
        subjectNameFound: '',
        value: null,
        type: 'scritto',
        date: null,
        period: null,
        note: ''
    })
}

function backToStep1() {
    step.value = 1
    recognizedGrades.value = []
    error.value = ''
}

function resetAll() {
    step.value = 1
    recognizedGrades.value = []
    previewUrl.value = null
    imageBase64.value = null
    error.value = ''
    importedCount.value = 0
}
</script>

<style scoped>
.upload-area {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    text-align: center;
    cursor: pointer;
    transition: all var(--transition-normal);
    background: var(--color-light);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.upload-area:hover,
.upload-area.is-dragover {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
}

.preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
}

.preview-img {
    max-height: 300px;
    max-width: 100%;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
}
</style>
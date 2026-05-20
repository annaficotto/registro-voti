<template>
    <div>
        <AppNavbar />
        <section class="section">
            <div class="container">

                <h2 class="title">
                    <span class="icon mr-2"><i class="fas fa-arrow-trend-up"></i></span>
                    Proiezione pagella
                </h2>
                <p class="subtitle is-6 has-text-grey mb-5 mt-4">
                    Ipotizza i voti finali e calcola la tua media pagella e i crediti
                </p>

                <!-- Tabella proiezioni -->
                <div class="box mb-5">
                    <table class="table is-fullwidth" style="background: var(--color-light);">
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th class="has-text-centered">Media attuale</th>
                                <th class="has-text-centered">Voto ipotetico</th>
                                <th class="has-text-centered">Voti necessari</th>
                                <th class="has-text-centered">Situazione</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sub in sortedSubjects" :key="sub.id">

                                <!-- Materia -->
                                <td>
                                    <span class="tag mr-2"
                                        :style="{ background: sub.color || '#3273dc', color: 'white' }">
                                        {{ sub.name.slice(0, 2).toUpperCase() }}
                                    </span>
                                    <span class="subject-name">{{ sub.name }}</span>
                                </td>

                                <!-- Media attuale -->
                                <td class="has-text-centered">
                                    <span class="tag is-medium has-text-weight-bold" :class="avgTagClass(sub)">
                                        {{ sub.average ?? '—' }}
                                    </span>
                                </td>

                                <!-- Voto ipotetico -->
                                <td class="has-text-centered">
                                    <input class="input is-small has-text-centered" style="width: 80px; margin: auto;"
                                        type="number" min="1" max="10" step="0.5" :placeholder="sub.average ?? '—'"
                                        v-model.number="projections[sub.id]" />
                                </td>

                                <!-- Voti necessari per raggiungere l'ipotetico -->
                                <td class="has-text-centered">
                                    <span v-if="projections[sub.id]" class="is-size-7" :class="neededClass(sub)">
                                        {{ neededText(sub) }}
                                    </span>
                                    <span v-else class="has-text-grey is-size-7">—</span>
                                </td>

                                <!-- Situazione -->
                                <td class="has-text-centered">
                                    <span v-if="!projections[sub.id]" class="has-text-grey is-size-7">—</span>
                                    <span v-else-if="effectiveGrade(sub) >= 6" class="tag is-success is-light">
                                        <span class="icon is-small"><i class="fas fa-check"></i></span>
                                        &nbsp;Sufficiente
                                    </span>
                                    <span v-else class="tag is-danger is-light">
                                        <span class="icon is-small"><i class="fas fa-xmark"></i></span>
                                        &nbsp;Insufficiente
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <span class="tag mr-2" style="background: #6c757d; color: white;">CO</span>
                                    <span class="subject-name">Comportamento</span>
                                </td>
                                <td class="has-text-centered">
                                    <span class="tag is-medium is-light" style="color: #1a1a2e;">—</span>
                                </td>
                                <td class="has-text-centered">
                                    <input class="input is-small has-text-centered" style="width: 80px; margin: auto;"
                                        type="number" min="1" max="10" step="1" placeholder="es. 9"
                                        v-model.number="comportamento" />
                                </td>
                                <td class="has-text-centered">
                                    <span class="has-text-grey is-size-7">—</span>
                                </td>
                                <td class="has-text-centered">
                                    <span v-if="comportamento" class="tag is-light is-size-7">
                                        {{ comportamento >= 6 ? 'Ok' : 'Insufficiente' }}
                                    </span>
                                    <span v-else class="has-text-grey is-size-7">—</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Riepilogo pagella -->
                <div class="columns">

                    <!-- Media pagella -->
                    <div class="column">
                        <div class="box has-text-centered">
                            <p class="heading">
                                <span class="icon"><i class="fas fa-chart-simple"></i></span>
                                Media pagella ipotetica
                            </p>
                            <p class="title is-1" :class="mediaPagellaClass">
                                {{ mediaPagella ?? '—' }}
                            </p>
                            <p class="is-size-7 has-text-grey">
                                basata sui voti ipotetici inseriti
                            </p>
                        </div>
                    </div>

                    <!-- Crediti -->
                    <div class="column">
                        <div class="box has-text-centered">
                            <p class="heading">
                                <span class="icon"><i class="fas fa-award"></i></span>
                                Crediti scolastici
                            </p>
                            <p class="title is-1 has-text-primary">
                                {{ crediti ?? '—' }}
                            </p>
                            <p class="is-size-7 has-text-grey mt-2">
                                <span v-if="store.settings.year < 3" class="has-text-grey">
                                    I crediti vengono assegnati dal 3° anno in poi
                                </span>
                                <span v-else-if="mediaPagella && crediti">
                                    {{ annoLabel }} — media {{ mediaPagella }} → fascia {{ crediti }}
                                </span>
                                <span v-else-if="mediaPagella && mediaPagella < 6 && store.settings.year !== 5"
                                    class="has-text-danger">
                                    Media insufficiente — nessun credito
                                </span>
                                <span v-else>inserisci i voti ipotetici</span>
                            </p>
                        </div>
                    </div>

                    <!-- Materie insufficienti -->
                    <div class="column">
                        <div class="box">
                            <p class="heading">
                                <span class="icon"><i class="fas fa-triangle-exclamation"></i></span>
                                Materie a rischio
                            </p>
                            <div v-if="!insufficienti.length" class="has-text-centered py-3">
                                <span class="icon has-text-success is-large">
                                    <i class="fas fa-check-double fa-2x"></i>
                                </span>
                                <p class="has-text-success mt-2 has-text-weight-semibold">Tutto in regola!</p>
                            </div>
                            <div v-else>
                                <div v-for="sub in insufficienti" :key="sub.id"
                                    class="is-flex is-align-items-center mb-2" style="gap: var(--space-2);">
                                    <span class="tag is-small"
                                        :style="{ background: sub.color || '#3273dc', color: 'white' }">
                                        {{ sub.name.slice(0, 2).toUpperCase() }}
                                    </span>
                                    <span class="is-size-7">{{ sub.name }}</span>
                                    <span class="tag is-danger is-light is-small ml-auto">
                                        {{ effectiveGrade(sub) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Pulsante reset -->
                <div class="has-text-right mt-3">
                    <button class="button is-light is-small" @click="resetProjections">
                        <span class="icon"><i class="fas fa-rotate-left"></i></span>
                        <span>Reset proiezioni</span>
                    </button>
                </div>

            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGradesStore } from '@/stores/grades'
import { useGradeCalc } from '@/composables/useGradeCalc'
import AppNavbar from '@/components/layout/AppNavbar.vue'

const store = useGradesStore()
const { averagePerSubject, calcNeededGrade } = useGradeCalc(store, null, null, 'all');

// Voti ipotetici: { subjectId: value }
const projections = ref({})

// Voto di comportamento
const comportamento = ref(null)

// Materie ordinate alfabeticamente con dati calcolati
const sortedSubjects = computed(() =>
    [...averagePerSubject.value].sort((a, b) => a.name.localeCompare(b.name))
)

// Voto effettivo: ipotetico se inserito, altrimenti media attuale
function effectiveGrade(sub) {
    const p = projections.value[sub.id]
    if (p !== undefined && p !== null && p !== '') return p
    return sub.average
}

// Media pagella: media dei voti effettivi di tutte le materie
const mediaPagella = computed(() => {
    const values = sortedSubjects.value
        .map(s => effectiveGrade(s))
        .filter(v => v !== null && v !== undefined && v !== '')
    if (comportamento.value) values.push(comportamento.value)
    if (!values.length) return null
    const sum = values.reduce((a, b) => a + b, 0)
    return Math.round((sum / values.length) * 100) / 100
})

// Crediti secondo la tabella ufficiale
const crediti = computed(() => {
    const m = mediaPagella.value
    const year = store.settings.year ?? 4
    if (!m) return null
    if (year < 3) return null // 1° e 2° anno: nessun credito

    // Tabella crediti per anno
    // M<6: solo 5° anno ha crediti (7-8)
    // Le fasce restituiscono la fascia minima (il massimo dipende da altri fattori)
    const table = {
        3: [
            { min: 6, max: 6, credito: '7-8' },
            { min: 6, max: 7, credito: '8-9' },
            { min: 7, max: 8, credito: '9-10' },
            { min: 8, max: 9, credito: '10-11' },
            { min: 9, max: 10, credito: '11-12' },
        ],
        4: [
            { min: 6, max: 6, credito: '8-9' },
            { min: 6, max: 7, credito: '9-10' },
            { min: 7, max: 8, credito: '10-11' },
            { min: 8, max: 9, credito: '11-12' },
            { min: 9, max: 10, credito: '12-13' },
        ],
        5: [
            { min: 0, max: 6, credito: '7-8' },
            { min: 6, max: 6, credito: '9-10' },
            { min: 6, max: 7, credito: '10-11' },
            { min: 7, max: 8, credito: '11-12' },
            { min: 8, max: 9, credito: '13-14' },
            { min: 9, max: 10, credito: '14-15' },
        ]
    }

    const fasce = table[year] || table[4]

    if (m < 6) {
        if (year === 5) return '7-8'
        return null
    }
    if (m === 6) return fasce.find(f => f.min === 6 && f.max === 6)?.credito ?? null
    for (const fascia of [...fasce].reverse()) {
        if (m > fascia.min && m <= fascia.max) return fascia.credito
    }
    return null
})

// Materie insufficienti nella proiezione
const insufficienti = computed(() =>
    sortedSubjects.value.filter(s => {
        const g = effectiveGrade(s)
        return g !== null && g !== undefined && g !== '' && g < 6
    })
)

// Voti necessari per raggiungere il voto ipotetico
function neededText(sub) {
    const target = projections.value[sub.id]
    if (!target) return '—'
    const currentGrades = store.grades
        .filter(g => g.subjectId === sub.id)
        .map(g => g.value)
    const n = currentGrades.length
    if (!n) return `Serve almeno ${target}`
    const sum = currentGrades.reduce((a, b) => a + b, 0)
    const currentAvg = sum / n
    if (currentAvg >= target) return 'Già raggiunto'
    const needed = Math.round((target * (n + 1) - sum) * 100) / 100
    if (needed > 10) return 'Impossibile con un voto'
    return `Serve almeno ${needed}`
}

function neededClass(sub) {
    const target = projections.value[sub.id]
    if (!target) return ''
    const currentGrades = store.grades
        .filter(g => g.subjectId === sub.id)
        .map(g => g.value)
    const n = currentGrades.length
    if (!n) return 'has-text-info'
    const sum = currentGrades.reduce((a, b) => a + b, 0)
    const currentAvg = sum / n
    if (currentAvg >= target) return 'has-text-success'
    const needed = (target * (n + 1) - sum)
    if (needed > 10) return 'has-text-danger'
    return 'has-text-info'
}

function avgTagClass(sub) {
    if (!sub.average) return 'is-light'
    const target = sub.targetAverage ?? store.settings.targetAverage
    if (sub.average >= target) return 'is-success'
    if (sub.average >= 6) return 'is-warning'
    return 'is-danger'
}

const mediaPagellaClass = computed(() => {
    const m = mediaPagella.value
    if (!m) return ''
    if (m >= 8) return 'has-text-success'
    if (m >= 6) return 'has-text-warning'
    return 'has-text-danger'
})

const annoLabel = computed(() => {
    const y = store.settings.year ?? 4
    return `${y}° anno`
})

function resetProjections() {
    projections.value = {}
    comportamento.value = null
}
</script>
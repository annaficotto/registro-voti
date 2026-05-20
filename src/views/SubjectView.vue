<template>
    <div>
        <AppNavbar />

        <section class="section">
            <div class="container">
                <nav class="breadcrumb">
                    <ul>
                        <li>
                            <a @click="$router.back()">
                                <span class="icon"><i class="fas fa-house"></i></span>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li class="is-active">
                            <a>{{ subject?.name }}</a>
                        </li>
                    </ul>
                </nav>

                <div class="field has-addons mb-4">
                    <div class="control">
                        <button class="button is-small" :class="localPeriod === 'all' ? 'is-primary' : 'is-light'"
                            @click="localPeriod = 'all'">Tutto l'anno</button>
                    </div>
                    <div class="control">
                        <button class="button is-small" :class="localPeriod === 'Q1' ? 'is-primary' : 'is-light'"
                            @click="localPeriod = 'Q1'">1° Quadrimestre</button>
                    </div>
                    <div class="control">
                        <button class="button is-small" :class="localPeriod === 'Q2' ? 'is-primary' : 'is-light'"
                            @click="localPeriod = 'Q2'">2° Quadrimestre</button>
                    </div>
                </div>

                <div v-if="!subject" class="notification is-warning">
                    <span class="icon"><i class="fas fa-triangle-exclamation"></i></span>
                    Materia non trovata.
                </div>

                <template v-else>
                    <!-- Header -->
                    <div class="box mb-5">
                        <div class="level">
                            <div class="level-left">
                                <div class="level-item">
                                    <div>
                                        <h2 class="title mb-1">
                                            <span class="icon mr-2"><i class="fas fa-book"></i></span>
                                            {{ subject.name }}
                                        </h2>
                                        <p class="subtitle is-6 has-text-grey mt-3 mb-1">
                                            {{ subjectData?.count || 0 }} voti inseriti
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="level-right">
                                <div class="level-item">
                                    <span class="tag is-large has-text-weight-bold" :class="avgTagClass">
                                        Media: {{ subjectData?.average ?? "-" }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Media generale -->
                    <div class="box mb-4">
                        <p class="heading">
                            <span class="icon"><i class="fas fa-chart-simple"></i></span>
                            Media generale
                        </p>
                        <div class="columns is-mobile">
                            <div class="column has-text-centered">
                                <p class="is-size-7 has-text-grey mb-1">Totale</p>
                                <p class="title is-3" :class="avgColorClass">{{ subjectData?.average ?? '—' }}</p>
                            </div>
                            <div class="column has-text-centered">
                                <p class="is-size-7 has-text-grey mb-1">
                                    <span class="icon is-small"><i class="fas fa-pen-clip"></i></span> Scritto
                                </p>
                                <p class="title is-4 has-text-grey">{{ subjectData?.averageScritto ?? '—' }}</p>
                                <p class="is-size-7 has-text-grey">{{ countByType('scritto') }} voti</p>
                            </div>
                            <div class="column has-text-centered">
                                <p class="is-size-7 has-text-grey mb-1">
                                    <span class="icon is-small"><i class="fas fa-comments"></i></span> Orale
                                </p>
                                <p class="title is-4 has-text-grey">{{ subjectData?.averageOrale ?? '—' }}</p>
                                <p class="is-size-7 has-text-grey">{{ countByType('orale') }} voti</p>
                            </div>
                            <div class="column has-text-centered">
                                <p class="is-size-7 has-text-grey mb-1">
                                    <span class="icon is-small"><i class="fas fa-screwdriver-wrench"></i></span> Pratico
                                </p>
                                <p class="title is-4 has-text-grey">{{ subjectData?.averagePratico ?? '—' }}</p>
                                <p class="is-size-7 has-text-grey">{{ countByType('pratico') }} voti</p>
                            </div>
                        </div>
                    </div>

                    <!-- Medie per periodo -->
                    <div class="columns mb-4">

                        <!-- Q1 -->
                        <div class="column">
                            <div class="box">
                                <p class="heading mb-3">
                                    <span class="icon"><i class="fas fa-calendar"></i></span>
                                    1° Quadrimestre
                                    <span class="tag is-light is-small ml-2">{{ subjectData?.q1.count ?? 0 }}
                                        voti</span>
                                </p>
                                <div class="columns is-mobile is-multiline">
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey">Media</p>
                                        <p class="title is-4" :class="periodAvgClass(subjectData?.q1.average)">
                                            {{ subjectData?.q1.average ?? '—' }}
                                        </p>
                                    </div>
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey"><span class="icon is-small"><i
                                                    class="fas fa-pen-clip"></i></span> Scritto</p>
                                        <p class="title is-5 has-text-grey">{{ subjectData?.q1.scritto ?? '—' }}</p>
                                    </div>
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey"><span class="icon is-small"><i
                                                    class="fas fa-comments"></i></span> Orale</p>
                                        <p class="title is-5 has-text-grey">{{ subjectData?.q1.orale ?? '—' }}</p>
                                    </div>
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey"><span class="icon is-small"><i
                                                    class="fas fa-screwdriver-wrench"></i></span> Pratico</p>
                                        <p class="title is-5 has-text-grey">{{ subjectData?.q1.pratico ?? '—' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q2 -->
                        <div class="column">
                            <div class="box">
                                <p class="heading mb-3">
                                    <span class="icon"><i class="fas fa-calendar"></i></span>
                                    2° Quadrimestre
                                    <span class="tag is-light is-small ml-2">{{ subjectData?.q2.count ?? 0 }}
                                        voti</span>
                                </p>
                                <div class="columns is-mobile is-multiline">
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey">Media</p>
                                        <p class="title is-4" :class="periodAvgClass(subjectData?.q2.average)">
                                            {{ subjectData?.q2.average ?? '—' }}
                                        </p>
                                    </div>
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey"><span class="icon is-small"><i
                                                    class="fas fa-pen-clip"></i></span> Scritto</p>
                                        <p class="title is-5 has-text-grey">{{ subjectData?.q2.scritto ?? '—' }}</p>
                                    </div>
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey"><span class="icon is-small"><i
                                                    class="fas fa-comments"></i></span> Orale</p>
                                        <p class="title is-5 has-text-grey">{{ subjectData?.q2.orale ?? '—' }}</p>
                                    </div>
                                    <div class="column has-text-centered">
                                        <p class="is-size-7 has-text-grey"><span class="icon is-small"><i
                                                    class="fas fa-screwdriver-wrench"></i></span> Pratico</p>
                                        <p class="title is-5 has-text-grey">{{ subjectData?.q2.pratico ?? '—' }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Voto necessario -->
                    <div class="box mb-4">
                        <div class="columns is-mobile is-vcentered">
                            <div class="column">
                                <p class="heading">
                                    <span class="icon"><i class="fas fa-bullseye"></i></span>
                                    Voto necessario per l'obiettivo ({{ subject.targetAverage ??
                                        store.settings.targetAverage }})
                                </p>
                                <p class="title is-3" :class="neededColorClass">{{ neededInfo.text }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Tabella voti -->
                    <div class="box">
                        <div class="level mb-4">
                            <div class="level-left">
                                <div class="level-item">
                                    <h2 class="title is-5">
                                        <span class="icon mr-1"><i class="fas fa-list"></i></span>
                                        Voti
                                        <span class="tag is-primary is-light ml-2" v-if="ui.selectedPeriod !== 'all'">
                                            {{ ui.selectedPeriod === 'Q1' ? '1° Quadrimestre' : '2° Quadrimestre' }}
                                        </span>
                                    </h2>
                                </div>
                            </div>
                            <div class="level-right">
                                <div class="level-item">
                                    <button class="button is-primary is-small" @click="showAdd = true">
                                        <span class="icon"><i class="fas fa-plus"></i></span>
                                        <span>Aggiungi voto</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div v-if="!subjectGrades.length" class="has-text-centered py-5 has-text-grey">
                            <span class="icon is-large"><i class="fas fa-pen-clip fa-2x"></i></span>
                            <p class="mt-2">Nessun voto ancora. Aggiungine uno!</p>
                        </div>

                        <table v-else class="table is-fullwidth is-striped is-hoverable">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Voto</th>
                                    <th>Tipo</th>
                                    <th>Periodo</th>
                                    <th>Note</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="grade in subjectGrades" :key="grade.id">
                                    <td>{{ formatDate(grade.date) }}</td>
                                    <td>
                                        <span class="tag has-text-weight-bold" :class="gradeTagClass(grade.value)">
                                            {{ grade.value }}
                                        </span>
                                    </td>
                                    <td>{{ tipoLabel(grade.type) }}</td>
                                    <td>
                                        {{ grade.period === "Q1" ? "1° quadrimestre" : "2° quadrimestre" }}
                                    </td>
                                    <td class="has-text-grey is-italic">{{ grade.note || "-" }}</td>
                                    <td>
                                        <div class="buttons are-small">
                                            <button class="button is-info is-light" @click="editingGrade = grade"
                                                title="Modifica">
                                                <span class="icon"><i class="fas fa-pen"></i></span>
                                            </button>
                                            <button class="button is-danger is-light" @click="deleteGrade(grade.id)"
                                                title="Elimina">
                                                <span class="icon"><i class="fas fa-xmark"></i></span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </div>
        </section>

        <!-- Modal aggiunta con materia preselezionata -->
        <AddGradeModal v-if="showAdd" :defaultSubjectId="route.params.id" @close="showAdd = false"
            @saved="showAdd = false" />

        <!-- Modal modifica voto -->
        <AddGradeModal v-if="editingGrade" :editGrade="editingGrade" @close="editingGrade = null"
            @saved="editingGrade = null" />
    </div>
</template>

<style scoped>
.subtitle {
    text-align: center;
}
</style>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGradesStore } from '@/stores/grades'
import { useUiStore } from '@/stores/ui'
import { useGradeCalc } from '@/composables/useGradeCalc'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AddGradeModal from '@/components/grades/AddGradeModal.vue'

const route = useRoute()
const store = useGradesStore()
const ui = useUiStore()
const showAdd = ref(false)
const editingGrade = ref(null)

// SubjectView usa sempre 'all' per i box Q1/Q2 (mostrano sempre entrambi)
const { averagePerSubject, calcNeededGrade } = useGradeCalc(store, null, null, 'all')

const subject = computed(() => store.subjects.find(s => s.id === route.params.id))
const subjectData = computed(() => averagePerSubject.value.find(s => s.id === route.params.id))

// La tabella voti in basso rispetta il filtro globale
const subjectGrades = computed(() => {
    const p = ui.selectedPeriod
    return store.grades
        .filter(g => g.subjectId === route.params.id && (p === 'all' || g.period === p))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
})

function countByType(type) {
    return subjectGrades.value.filter(g => g.type === type).length
}

const avgTagClass = computed(() => {
    const avg = subjectData.value?.average
    if (!avg) return 'is-light'
    const target = subject.value?.targetAverage ?? store.settings.targetAverage
    if (avg >= target) return 'is-success'
    if (avg >= 6) return 'is-warning'
    return 'is-danger'
})

const avgColorClass = computed(() => {
    const avg = subjectData.value?.average
    if (!avg) return ''
    const target = subject.value?.targetAverage ?? store.settings.targetAverage
    if (avg >= target) return 'has-text-success'
    if (avg >= 6) return 'has-text-warning'
    return 'has-text-danger'
})

const neededInfo = computed(() => {
    const r = calcNeededGrade(route.params.id)
    if (r.alreadyReached) return { text: 'Raggiunto' }
    if (!r.feasible) return { text: '> 10' }
    return { text: String(r.needed) }
})

const neededColorClass = computed(() => {
    const r = calcNeededGrade(route.params.id)
    if (r.alreadyReached) return 'has-text-success'
    if (!r.feasible) return 'has-text-danger'
    return 'has-text-info'
})

async function deleteGrade(id) {
    if (confirm('Eliminare questo voto?')) await store.deleteGrade(id)
}

function formatDate(d) { return new Date(d).toLocaleDateString('it-IT') }
function tipoLabel(t) {
    return { scritto: 'Scritto', orale: 'Orale', pratico: 'Pratico' }[t] || t
}
function gradeTagClass(v) {
    if (v >= 7) return 'is-success'
    if (v >= 6) return 'is-warning'
    return 'is-danger'
}
function periodAvgClass(avg) {
    if (!avg) return ''
    const target = subject.value?.targetAverage ?? store.settings.targetAverage
    if (avg >= target) return 'has-text-success'
    if (avg >= 6) return 'has-text-warning'
    return 'has-text-danger'
}
</script>
<template>
    <div>
        <AppNavbar />
        <section class="section">
            <div class="container">
                <h2 class="title">
                    <span class="icon mr-1"><i class="fas fa-bullseye"></i></span> Calcolatore
                    obiettivo
                </h2>
                <p class="subtitle">
                    Scopri quanti voti ti servono per raggiungere la tua media obiettivo
                </p>

                <div class="target-card">
                    <label>La tua media obiettivo</label>
                    <div class="target-input">
                        <button @click="changeTarget(-0.09)">−</button>
                        <span class="target-value">{{ store.settings.targetAverage }}</span>
                        <button @click="changeTarget(+0.09)">+</button>
                    </div>
                </div>

                <div class="subjects-list">
                    <div v-for="sub in averagePerSubject" :key="sub.id" class="subject-goal"
                        :style="{ borderLeftColor: sub.color || '#1976D2' }">
                        <div class="sub-info">
                            <h3 class="subject-name">{{ sub.name }}</h3>
                        </div>

                        <div class="goal-result" :class="resultClass(sub.id)">
                            <div class="current-avg">
                                <p>Media attuale: <span class="subject-average">{{ sub.average ?? "-" }}</span></p>
                            </div>
                            <template v-if="sub.average === null">
                                <span class="no-grades">Nessun voto</span>
                            </template>
                            <template v-else-if="calcNeededGrade(sub.id).alreadyReached">
                                <span class="reached"><i class="fa-solid fa-check fa-bounce mr-1"
                                        style="color: rgb(67, 160, 71);"></i> Obiettivo raggiunto!</span>
                            </template>
                            <template v-else-if="!calcNeededGrade(sub.id).feasible">
                                <span class="hard"><i class="fa-solid fa-triangle-exclamation mr-1"
                                        style="color: rgb(229, 57, 53);"></i> Serve più di 10</span>
                            </template>
                            <template v-else>
                                <span class="needed-label">Voto minimo necessario:</span>
                                <span class="needed-value">{{ calcNeededGrade(sub.id).needed }}</span>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGradesStore } from '@/stores/grades'
import { useUiStore } from '@/stores/ui'
import { useGradeCalc } from '@/composables/useGradeCalc'
import AppNavbar from '@/components/layout/AppNavbar.vue'

const store = useGradesStore()
const ui = useUiStore()

const { averagePerSubject, calcNeededGrade } = useGradeCalc(store, null, null, computed(() => ui.selectedPeriod))

async function changeTarget(delta) {
    const raw = (store.settings.targetAverage * 10 + delta * 10) / 10
    const newVal = Math.min(10, Math.max(1, Math.round(raw * 10) / 10))
    await store.saveSettings({ ...store.settings, targetAverage: newVal })
}

function resultClass(subjectId) {
    const r = calcNeededGrade(subjectId)
    if (r.alreadyReached) return 'reached'
    if (!r.feasible) return 'hard'
    return 'normal'
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    background: #f5f7fa;
}

.content {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px 16px;
}

h1 {
    margin-bottom: 4px;
}

.subtitle {
    color: #666;
    margin-bottom: 24px;
}

.target-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
}

.target-card label {
    font-size: 14px;
    color: #666;
    font-weight: 600;
}

.target-input {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-top: 12px;
}

.target-input button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #1976d2;
    background: white;
    color: #1976d2;
    font-size: 20px;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s;
}

.target-input button:hover {
    background: #1976d2;
    color: white;
}

.target-value {
    font-size: 48px;
    font-weight: 700;
    color: #1976d2;
    min-width: 80px;
    text-align: center;
}

.subjects-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.subject-goal {
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    border-left: 4px solid #1976d2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.sub-info h3 {
    margin: 0 0 4px;
    font-size: 16px;
}

.current-avg {
    font-size: 13px;
    color: #888;
}

.goal-result {
    text-align: right;
}

.needed-label {
    display: block;
    font-size: 12px;
    color: #888;
}

.needed-value {
    font-size: 28px;
    font-weight: 700;
    color: #1976d2;
}

.reached {
    color: #43a047;
    font-weight: 600;
}

.hard {
    color: #e53935;
    font-weight: 600;
}

.no-grades {
    color: #999;
    font-style: italic;
}

.subject-average {
    color: var(--color-grey-dark);
    font-weight: bolder;
}
</style>
<template>
    <div class="page">
        <AppNavbar />
        <main class="content">
            <h1 class="title2">
                <span class="icon mr-1"><i class="fas fa-chart-simple"></i></span> Statistiche
            </h1>

            <div v-if="!stats" class="empty">
                Nessun voto ancora. Inizia ad inserire i tuoi voti!
            </div>

            <template v-else>
                <div class="stat-cards">
                    <div class="stat-card total">
                        <span class="stat-icon"><i class="fa-solid fa-paperclip" style="color: #1a1a2e;"></i></span>
                        <span class="stat-value">{{ stats.total }}</span>
                        <span class="stat-label">Voti totali</span>
                    </div>
                    <div class="stat-card good">
                        <span class="stat-icon"><i class="fa-solid fa-check" style="color: #43a047;"></i></span>
                        <span class="stat-value">{{ stats.sufficient }}</span>
                        <span class="stat-label">Sufficienze</span>
                    </div>
                    <div class="stat-card bad">
                        <span class="stat-icon"><i class="fa-solid fa-xmark" style="color: #e53935;"></i></span>
                        <span class="stat-value">{{ stats.insufficient }}</span>
                        <span class="stat-label">Insufficienze</span>
                    </div>
                    <div class="stat-card max">
                        <span class="stat-icon"><i class="fa-solid fa-award" style="color: #d8bc58;"></i></span>
                        <span class="stat-value">{{ stats.max }}</span>
                        <span class="stat-label">Voto massimo</span>
                    </div>
                    <div class="stat-card min">
                        <span class="stat-icon"><i class="fa-solid fa-arrow-trend-down" style="color: #ff6a00;"></i></span>
                        <span class="stat-value">{{ stats.min }}</span>
                        <span class="stat-label">Voto minimo</span>
                    </div>
                    <div class="stat-card percent-suff">
                        <span class="stat-icon"><i class="fa-solid fa-chart-line" style="color: #2697f4;"></i></span>
                        <span class="stat-value">{{ stats.percentSufficient }}%</span>
                        <span class="stat-label">% sufficienze</span>
                    </div>
                </div>

                <!-- Distribuzione voti -->
                <div class="chart-card">
                    <h2>Distribuzione voti</h2>
                    <div class="bar-chart">
                        <div v-for="i in 10" :key="i" class="bar-col">
                            <div class="bar-wrap">
                                <div class="bar" :class="i >= 6 ? 'bar-good' : 'bar-bad'"
                                    :style="{ height: barHeight(i) }">
                                    <span v-if="stats.distribution[i] > 0" class="bar-count">
                                        {{ stats.distribution[i] }}
                                    </span>
                                </div>
                            </div>
                            <span class="bar-label">{{ i }}</span>
                        </div>
                    </div>
                </div>

                <!-- Media per materia -->
                <div class="chart-card">
                    <h2>Media per materia</h2>
                    <div class="subject-bars">
                        <div v-for="sub in averagePerSubject" :key="sub.id" class="subject-bar-row">
                            <span class="sub-name">{{ sub.name }}</span>
                            <div class="sub-bar-wrap">
                                <div class="sub-bar" :style="{ width: sub.average ? (sub.average / 10) * 100 + '%' : '0%', background: sub.color || '#1976D2',}"></div>
                            </div>
                            <span class="subject-average">{{ sub.average ?? "-" }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </main>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useGradesStore } from "@/stores/grades";
import { useGradeCalc } from "@/composables/useGradeCalc";
import AppNavbar from "@/components/layout/AppNavbar.vue";

const store = useGradesStore();
const { stats, averagePerSubject } = useGradeCalc(store);

const maxCount = computed(() => {
    if (!stats.value) return 1;
    return Math.max(...Object.values(stats.value.distribution), 1);
});

function barHeight(i) {
    if (!stats.value) return "0%";
    return (stats.value.distribution[i] / maxCount.value) * 100 + "%";
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    background: #f5f7fa;
}

.content {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px;
}

h1 {
    margin-bottom: 24px;
}

.stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-card.total {
    border-top: 3px solid #1a1a2e;
}

.stat-card.good {
    border-top: 3px solid hsl(123, 41%, 45%);
}

.stat-card.bad {
    border-top: 3px solid hsl(1, 77%, 55%);
}

.stat-card.max {
    border-top: 3px solid #d8bc58;
}

.stat-card.min {
    border-top: 3px solid #ff6a00;
}

.stat-card.percent-suff {
    border-top: 3px solid #2699f4;
}

.stat-icon {
    font-size: 24px;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
}

.stat-label {
    font-size: 12px;
    color: #888;
}

.chart-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 16px;
}

.chart-card h2 {
    margin: 0 0 20px;
    font-size: 18px;
}

.bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 150px;
}

.bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
}

.bar-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
}

.bar {
    width: 100%;
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: height 0.5s ease;
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
}

.bar-good {
    background: #43a047;
}

.bar-bad {
    background: #e53935;
}

.bar-count {
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding-top: 4px;
}

.bar-label {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
}

.subject-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.subject-bar-row {
    display: grid;
    grid-template-columns: 160px 1fr 48px;
    align-items: center;
    gap: 12px;
}

.sub-name {
    font-size: 14px;
    color: #444;
}

.sub-bar-wrap {
    background: #f0f0f0;
    border-radius: 4px;
    height: 10px;
    overflow: hidden;
}

.sub-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
}

.subject-average {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    text-align: right;
}

.empty {
    text-align: center;
    padding: 48px;
    color: #999;
}
</style>
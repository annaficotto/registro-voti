<template>
    <div class="card is-clickable subject-card">
        <div class="card-content">
            <div class="level is-mobile mb-2">
                <div class="level-left">
                    <div class="level-item">
                        <span class="tag is-medium has-text-weight-bold"
                            :style="{ background: subject.color || '#3273dc', color: 'white' }">
                            {{ subject.name.slice(0, 2).toUpperCase() }}
                        </span>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <span class="tag is-large has-text-weight-bold" :class="avgTagClass">
                            {{ subject.average ?? "-" }}
                        </span>
                    </div>
                </div>
            </div>

            <p class="subject-name mb-2">{{ subject.name }}</p>

            <progress class="progress is-small mb-2" :class="progressClass" :value="subject.average ?? 0" max="10" />

            <div class="level is-mobile is-size-7 has-text-grey">
                <div class="level-left">
                    <span>
                        <span class="icon is-small"><i class="fas fa-pen-clip"></i></span>
                        {{ subject.count }} vot{{ subject.count === 1 ? "o" : "i" }}
                    </span>
                </div>
                <div class="level-right">
                    <span v-if="subject.lastGrade">
                        Ultimo: {{ subject.lastGrade.value }}
                    </span>
                </div>
            </div>

            <p class="is-size-7 has-text-grey mt-1 is-italic">
                <span class="icon is-small"><i class="fas fa-bullseye"></i></span>
                {{ neededText }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGradeCalc } from '@/composables/useGradeCalc'
import { useGradesStore } from '@/stores/grades'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
    subject: Object,
    target: Number
})

const store = useGradesStore()
const ui = useUiStore()
const { calcNeededGrade } = useGradeCalc(store, null, null, computed(() => ui.selectedPeriod))

const avgTagClass = computed(() => {
    if (!props.subject.average) return 'is-light'
    const target = props.subject.targetAverage ?? props.target
    if (props.subject.average >= target) return 'is-success'
    if (props.subject.average >= 6) return 'is-warning'
    return 'is-danger'
})

const progressClass = computed(() => {
    if (!props.subject.average) return 'is-light'
    const target = props.subject.targetAverage ?? props.target
    if (props.subject.average >= target) return 'is-success'
    if (props.subject.average >= 6) return 'is-warning'
    return 'is-danger'
})

const neededText = computed(() => {
    const result = calcNeededGrade(props.subject.id)
    if (result.alreadyReached) return 'Obiettivo raggiunto'
    if (!result.feasible) return 'Obiettivo difficile'
    return `Serve almeno ${result.needed} per l'obiettivo`
})
</script>

<style scoped>
.subject-card {
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}

.subject-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}


.good {
    border-top: 3px solid #43a047;
}

.bad {
    border-top: 3px solid #e53935;
}

.warning {
    border-top: 3px solid #ffea00;
}
</style>
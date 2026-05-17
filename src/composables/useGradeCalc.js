import { computed, toRef, isRef } from 'vue'

export function useGradeCalc(subjectsOrStore, gradesOrNull, settingsOrNull) {
    // Supporta sia (store.subjects, store.grades, store.settings)
    // che (store) direttamente
    const subjects = isRef(subjectsOrStore) ? subjectsOrStore : toRef(subjectsOrStore, 'subjects')
    const grades = isRef(gradesOrNull) ? gradesOrNull : toRef(subjectsOrStore, 'grades')
    const settings = isRef(settingsOrNull) ? settingsOrNull : toRef(subjectsOrStore, 'settings')

    function getGradesForSubject(subjectId) {
        return (grades.value || []).filter(g => g.subjectId === subjectId)
    }

    function calcAverage(values) {
        if (!values || !values.length) return null
        const sum = values.reduce((a, b) => a + b, 0)
        return Math.round((sum / values.length) * 100) / 100
    }

    const averagePerSubject = computed(() => {
        return (subjects.value || []).map(sub => {
            const subGrades = getGradesForSubject(sub.id)
            const allValues = subGrades.map(g => g.value)

            const q1Grades = subGrades.filter(g => g.period === 'Q1')
            const q2Grades = subGrades.filter(g => g.period === 'Q2')

            const orali = subGrades.filter(g => g.type === 'orale').map(g => g.value)
            const scritti = subGrades.filter(g => g.type === 'scritto').map(g => g.value)
            const pratici = subGrades.filter(g => g.type === 'pratico').map(g => g.value)

            const q1Orali = q1Grades.filter(g => g.type === 'orale').map(g => g.value)
            const q1Scritti = q1Grades.filter(g => g.type === 'scritto').map(g => g.value)
            const q1Pratici = q1Grades.filter(g => g.type === 'pratico').map(g => g.value)

            const q2Orali = q2Grades.filter(g => g.type === 'orale').map(g => g.value)
            const q2Scritti = q2Grades.filter(g => g.type === 'scritto').map(g => g.value)
            const q2Pratici = q2Grades.filter(g => g.type === 'pratico').map(g => g.value)

            const sorted = [...subGrades].sort((a, b) => new Date(b.date) - new Date(a.date))

            return {
                ...sub,
                average: calcAverage(allValues),
                averageOrale: calcAverage(orali),
                averageScritto: calcAverage(scritti),
                averagePratico: calcAverage(pratici),

                q1: {
                    average: calcAverage(q1Grades.map(g => g.value)),
                    orale: calcAverage(q1Orali),
                    scritto: calcAverage(q1Scritti),
                    pratico: calcAverage(q1Pratici),
                    count: q1Grades.length
                },
                q2: {
                    average: calcAverage(q2Grades.map(g => g.value)),
                    orale: calcAverage(q2Orali),
                    scritto: calcAverage(q2Scritti),
                    pratico: calcAverage(q2Pratici),
                    count: q2Grades.length
                },

                count: subGrades.length,
                grades: subGrades,
                sufficient: calcAverage(allValues) >= 6,
                lastGrade: sorted[0] || null
            }
        })
    })

    const globalAverage = computed(() => {
        const avgs = averagePerSubject.value
            .filter(s => s.average !== null)
            .map(s => s.average)
        return calcAverage(avgs)
    })

    function calcNeededGrade(subjectId) {
        const subject = (subjects.value || []).find(s => s.id === subjectId)
        const target = subject?.targetAverage ?? (settings.value || {}).targetAverage ?? 8
        const subGrades = getGradesForSubject(subjectId).map(g => g.value)
        const n = subGrades.length
        if (!n) return { needed: target, feasible: true, alreadyReached: false }
        const sum = subGrades.reduce((a, b) => a + b, 0)
        const needed = Math.round((target * (n + 1) - sum) * 100) / 100
        return {
            needed,
            feasible: needed <= 10,
            alreadyReached: (sum / n) >= target
        }
    }

    const stats = computed(() => {
        const allValues = (grades.value || []).map(g => g.value)
        if (!allValues.length) return null
        const sufficient = allValues.filter(v => v >= 6).length
        const insufficient = allValues.filter(v => v < 6).length
        const distribution = {}
        for (let i = 1; i <= 10; i++) {
            distribution[i] = allValues.filter(v => Math.floor(v) === i).length
        }
        return {
            total: allValues.length,
            sufficient,
            insufficient,
            percentSufficient: Math.round((sufficient / allValues.length) * 100),
            max: Math.max(...allValues),
            min: Math.min(...allValues),
            distribution
        }
    })

    const averageTrend = computed(() => {
        const sorted = [...(grades.value || [])].sort((a, b) => new Date(a.date) - new Date(b.date))
        return sorted.map((grade, idx) => {
            const values = sorted.slice(0, idx + 1).map(g => g.value)
            return {
                date: grade.date,
                average: calcAverage(values),
                grade: grade.value,
                subject: grade.subjectId
            }
        })
    })

    return {
        averagePerSubject,
        globalAverage,
        calcNeededGrade,
        stats,
        averageTrend,
        calcAverage,
        getGradesForSubject
    }
}
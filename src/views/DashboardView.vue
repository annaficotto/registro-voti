<template>
    <div>
        <AppNavbar />
        <section class="section">
            <div class="container">
                <div class="level mb-5">
                    <div class="level-left">
                        <div class="level-item">
                            <div>
                                <h1 class="title">
                                    <span class="icon mr-2 ml-2"><i class="fas fa-graduation-cap"></i></span>
                                    Ciao!
                                </h1>
                                <p class="subtitle is-6 has-text-grey">
                                    Anno scolastico {{ store.settings.schoolYear }}
                                    <span v-if="store.settings.class"> - {{ store.settings.class }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="level-right">
                        <div class="level-item">
                            <button class="button is-primary" @click="showAddGrade = true">
                                <span class="icon"><i class="fas fa-plus"></i></span>
                                <span>Aggiungi voto</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Media generale -->
                <div class="notification mb-5" :class="avgNotifClass">
                    <div class="columns is-vcentered">
                        <div class="column">
                            <p class="is-size-7 has-text-weight-semibold mb-1">MEDIA GENERALE</p>
                            <p class="is-size-1 has-text-weight-bold">{{ globalAverage ?? "-" }}</p>
                        </div>
                        <div class="column is-narrow has-text-right">
                            <p class="is-size-7">
                                <span class="icon"><i class="fas fa-bullseye"></i></span> Obiettivo
                            </p>
                            <p class="is-size-3 has-text-weight-bold">
                                {{ store.settings.targetAverage }}
                            </p>
                        </div>
                    </div>
                </div>

                <div v-if="store.loading" class="has-text-centered py-6 has-text-grey">
                    <span class="icon is-large"><i class="fas fa-spinner fa-spin"></i></span>
                    <p>Caricamento...</p>
                </div>

                <div v-else-if="!store.subjects.length" class="box has-text-centered py-6">
                    <span class="icon is-large has-text-grey"><i class="fas fa-book-open fa-2x"></i></span>
                    <p class="has-text-grey my-4">
                        Nessuna materia ancora. Aggiungine una nelle impostazioni!
                    </p>
                    <router-link to="/settings" class="button is-primary is-outlined">
                        Vai alle impostazioni
                        <span class="icon ml-1"><i class="fas fa-arrow-right"></i></span>
                    </router-link>
                </div>

                <div v-else class="columns is-multiline">
                    <div v-for="sub in sortedSubjects" :key="sub.id" class="column is-6-tablet is-4-desktop">
                        <SubjectCard :subject="sub" :target="store.settings.targetAverage"
                            @click="$router.push(`/subject/${sub.id}`)" />
                    </div>
                </div>
            </div>
        </section>

        <AddGradeModal v-if="showAddGrade" @close="showAddGrade = false" @saved="showAddGrade = false" />
    </div>
</template>

<style scoped>
@media screen and (min-width: 769px) {
    .title {
        text-align: left;
    }
}
</style>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useGradesStore } from "@/stores/grades";
import { useGradeCalc } from "@/composables/useGradeCalc";
import AppNavbar from "@/components/layout/AppNavbar.vue";
import SubjectCard from "@/components/subjects/SubjectCard.vue";
import AddGradeModal from "@/components/grades/AddGradeModal.vue";

const store = useGradesStore();
const showAddGrade = ref(false);

const { averagePerSubject, globalAverage } = useGradeCalc(store);

// Materie in ordine alfabetico con i dati calcolati
const sortedSubjects = computed(() =>
    [...averagePerSubject.value].sort((a, b) => a.name.localeCompare(b.name))
);

const avgNotifClass = computed(() => {
    if (!globalAverage.value) return "is-light";
    if (globalAverage.value >= store.settings.targetAverage) return "is-success";
    if (globalAverage.value >= 6) return "is-warning";
    return "is-danger";
});

onMounted(() => store.loadData());
</script>
<template>
    <div>
        <AppNavbar />
        <section class="section">
            <div class="container is-narrow">
                <h2 class="title">
                    <span class="icon mr-2"><i class="fas fa-gear"></i></span>
                    Impostazioni
                </h2>

                <!-- Impostazioni generali -->
                <div class="box mb-5">
                    <h2 class="title is-5 mb-4">Generali</h2>

                    <div class="field">
                        <label class="label">Anno scolastico</label>
                        <div class="control">
                            <input class="input" v-model="localSettings.schoolYear" type="text"
                                placeholder="es. 2025-2026">
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Classe</label>
                        <div class="control">
                            <input class="input" v-model="localSettings.class" type="text" placeholder="es. 4IC">
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Anno di corso</label>
                        <div class="control">
                            <div class="select is-fullwidth">
                                <select v-model.number="localSettings.year">
                                    <option :value="3">1° anno</option>
                                    <option :value="3">2° anno</option>
                                    <option :value="3">3° anno</option>
                                    <option :value="4">4° anno</option>
                                    <option :value="5">5° anno</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Media obiettivo generale</label>
                        <div class="control">
                            <input class="input" v-model.number="localSettings.targetAverage" type="number" min="1"
                                max="10" step="0.5">
                        </div>
                    </div>

                    <button class="button is-primary" @click="saveSettings">
                        <span class="icon"><i class="fas fa-check"></i></span>
                        <span>Salva impostazioni</span>
                    </button>
                    <span v-if="settingsSaved" class="has-text-success ml-3">
                        <span class="icon"><i class="fas fa-check"></i></span> Salvato!
                    </span>
                </div>

                <!-- Gestione materie -->
                <div class="box">
                    <h2 class="title is-5 mb-4">
                        <span class="icon mr-1"><i class="fas fa-book"></i></span>
                        Materie
                    </h2>

                    <div v-if="!sortedSubjects.length" class="has-text-grey has-text-centered py-3">
                        Nessuna materia ancora.
                    </div>

                    <div v-for="sub in sortedSubjects" :key="sub.id" class="box mb-3 p-3">
                        <div v-if="editingSubject?.id === sub.id">
                            <!-- Modalità modifica -->
                            <div class="columns is-vcentered">
                                <div class="column is-two-thirds">
                                    <input class="input" v-model="editingSubject.name" placeholder="Nome materia">
                                </div>
                                <div class="column is-narrow">
                                    <input class="input" v-model.number="editingSubject.targetAverage" type="number"
                                        min="1" max="10" placeholder="Obiettivo" style="width: 90px">
                                </div>
                                <div class="column is-narrow">
                                    <input type="color" v-model="editingSubject.color"
                                        style="width: 36px; height: 36px; border: none; border-radius: 6px; cursor: pointer;">
                                </div>
                                <div class="column is-narrow">
                                    <div class="buttons are-small">
                                        <button class="button is-success is-light" @click="saveSubjectEdit">
                                            <span class="icon"><i class="fas fa-check"></i></span>
                                        </button>
                                        <button class="button is-light" @click="editingSubject = null">
                                            <span class="icon"><i class="fas fa-xmark"></i></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else class="is-flex is-align-items-center is-justify-content-space-between"
                            style="gap: var(--space-2)">
                            <div class="is-flex is-align-items-center"
                                style="gap: var(--space-2); min-width: 0; flex: 1">
                                <span class="tag is-flex-shrink-0"
                                    :style="{ background: sub.color || '#3273dc', color: 'white' }">
                                    {{ sub.name.slice(0, 2).toUpperCase() }}
                                </span>
                                <span class="has-text-weight-semibold is-flex-shrink-1 subject-name"
                                    style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                                    {{ sub.name }}
                                </span>
                                <span class="tag is-dark is-flex-shrink-0">
                                    <span class="icon is-small"><i class="fas fa-bullseye"></i></span>&ensp;{{
                                        sub.targetAverage ?? store.settings.targetAverage }}
                                </span>
                            </div>
                            <div class="is-flex is-flex-shrink-0" style="gap: var(--space-1)">
                                <button class="button is-small is-info is-light" @click="startEditSubject(sub)">
                                    <span class="icon"><i class="fas fa-pen"></i></span>
                                </button>
                                <button class="button is-small is-danger is-light" @click="deleteSubject(sub.id)">
                                    <span class="icon"><i class="fas fa-xmark"></i></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Aggiungi materia -->
                    <div class="columns is-vcentered is-mobile is-multiline mt-3 subject-add-row">
                        <div class="column is-two-quarters">
                            <input class="input" v-model="newSubject.name" type="text"
                                placeholder="Nome materia (es. Matematica)" @keyup.enter="addSubject">
                        </div>
                        <div class="column is-narrow col-target is-one-fifth">
                            <input class="input" v-model.number="newSubject.target" type="number" min="1" max="10"
                                placeholder="Obiettivo">
                        </div>
                        <div class="column is-narrow col-color">
                            <input type="color" v-model="newSubject.color"
                                style="width: 40px; height: 40px; border: none; border-radius: 6px; cursor: pointer; "
                                title="Colore materia">
                        </div>
                        <div class="column is-narrow">
                            <button class="button is-primary" @click="addSubject">
                                <span class="icon"><i class="fas fa-plus"></i></span>
                                <span>Aggiungi</span>
                            </button>
                        </div>
                    </div>
                    <p v-if="subjectError" class="help is-danger">
                        <span class="icon is-small"><i class="fas fa-triangle-exclamation"></i></span>
                        {{ subjectError }}
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.box {
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    color: var(--color-light);
}

@media screen and (max-width: 375px) {
    .columns {
        align-content: left;
    }
}
</style>

<script setup>
import { ref, computed } from "vue";
import { useGradesStore } from "@/stores/grades";
import AppNavbar from "@/components/layout/AppNavbar.vue";

const store = useGradesStore();

const localSettings = ref({ ...store.settings });
const settingsSaved = ref(false);
const subjectError = ref("");
const editingSubject = ref(null);
const newSubject = ref({ name: "", color: "#3273dc", target: null });

const sortedSubjects = computed(() =>
    [...store.subjects].sort((a, b) => a.name.localeCompare(b.name))
);

async function saveSettings() {
    await store.saveSettings(localSettings.value);
    settingsSaved.value = true;
    setTimeout(() => (settingsSaved.value = false), 2000);
}

function startEditSubject(sub) {
    editingSubject.value = { ...sub };
}

async function saveSubjectEdit() {
    await store.updateSubject(editingSubject.value.id, {
        name: editingSubject.value.name,
        color: editingSubject.value.color,
        targetAverage: editingSubject.value.targetAverage,
    });
    editingSubject.value = null;
}

async function addSubject() {
    subjectError.value = "";
    if (!newSubject.value.name.trim()) {
        subjectError.value = "Inserisci il nome della materia";
        return;
    }
    await store.addSubject({
        name: newSubject.value.name.trim(),
        color: newSubject.value.color,
        targetAverage: newSubject.value.target || null,
        weight: 1,
    });
    newSubject.value = { name: "", color: "#3273dc", target: null };
}

async function deleteSubject(id) {
    if (confirm("Eliminare questa materia e tutti i suoi voti?")) {
        await store.deleteSubject(id);
    }
}
</script>
<template>
    <div class="modal is-active">
        <div class="modal-background" @click="$emit('close')"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    <span class="icon mr-2"><i class="fas fa-pen-clip"></i></span>
                    {{ editGrade ? "Modifica voto" : "Aggiungi voto" }}
                </p>
                <button class="delete" @click="$emit('close')"></button>
            </header>

            <section class="modal-card-body">
                <!-- Materia -->
                <div class="field">
                    <label class="label">Materia *</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select v-model="form.subjectId">
                                <option value="" disabled>Seleziona materia</option>
                                <option v-for="sub in sortedSubjects" :key="sub.id" :value="sub.id">
                                    {{ sub.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Voto -->
                <div class="field">
                    <label class="label">Voto * (1-10)</label>
                    <div class="control">
                        <input class="input" v-model.number="form.value" type="number" min="1" max="10" step="0.25"
                            placeholder="es. 7.5" />
                    </div>
                </div>

                <!-- Tipo -->
                <div class="field">
                    <label class="label">Tipo</label>
                    <div class="control">
                        <label class="radio mr-4" v-for="t in tipi" :key="t.value">
                            <input type="radio" v-model="form.type" :value="t.value" />
                            {{ t.label }}
                        </label>
                    </div>
                </div>

                <!-- Data -->
                <div class="field">
                    <label class="label">Data *</label>
                    <div class="control">
                        <input class="input" v-model="form.date" type="date" @change="updatePeriodFromDate" />
                    </div>
                </div>

                <!-- Periodo -->
                <div class="field">
                    <label class="label"> Periodo </label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select v-model="form.period">
                                <option value="Q1">Primo trimestre</option>
                                <option value="Q2">Secondo pentamestre</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Note -->
                <div class="field">
                    <label class="label">Note (opzionale)</label>
                    <div class="control">
                        <input class="input" v-model="form.note" type="text" placeholder="es. Verifica capitolo 5" />
                    </div>
                </div>

                <div class="notification is-danger is-light" v-if="error">
                    <span class="icon"><i class="fas fa-triangle-exclamation"></i></span>
                    {{ error }}
                </div>
            </section>

            <footer class="modal-card-foot">
                <button class="button is-primary mr-2" @click="save" :disabled="saving">
                    <span class="icon"><i class="fas fa-check"></i></span>
                    <span>{{ saving ? "Salvataggio..." : editGrade ? "Salva modifiche" : "Salva voto" }}</span>
                </button>
                <button class="button is-danger" @click="$emit('close')"><span class="icon"><i
                            class="fas fa-xmark"></i></span><span>Annulla</span></button>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useGradesStore } from "@/stores/grades";

const props = defineProps({
    // Se passato, preseleziona la materia
    defaultSubjectId: {
        type: String,
        default: "",
    },
    // Se passato, siamo in modalità modifica
    editGrade: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(["close", "saved"]);
const store = useGradesStore();

const today = new Date().toISOString().split("T")[0];

function getPeriodFromDate(dateStr) {
    if (!dateStr) return "Q1";
    const month = new Date(dateStr).getMonth() + 1;
    // Q1: settembre (9) - dicembre (12)
    // Q2: gennaio (1) - giugno (6)
    return month >= 9 && month <= 12 ? "Q1" : "Q2";
}

const form = ref(
    props.editGrade
        ? { ...props.editGrade }
        : {
            subjectId: props.defaultSubjectId || "",
            value: "",
            type: "scritto",
            date: today,
            period: getPeriodFromDate(today),
            note: "",
        }
);

function updatePeriodFromDate() {
    form.value.period = getPeriodFromDate(form.value.date);
}

const sortedSubjects = computed(() =>
    [...store.subjects].sort((a, b) => a.name.localeCompare(b.name))
);

const tipi = [
    { value: "scritto", label: "Scritto" },
    { value: "orale", label: "Orale" },
    { value: "pratico", label: "Pratico" },
];

const error = ref("");
const saving = ref(false);

async function save() {
    error.value = "";
    if (!form.value.subjectId) {
        error.value = "Seleziona una materia";
        return;
    }
    if (!form.value.value || form.value.value < 1 || form.value.value > 10) {
        error.value = "Inserisci un voto valido tra 1 e 10";
        return;
    }
    if (!form.value.date) {
        error.value = "Inserisci una data";
        return;
    }

    saving.value = true;
    try {
        if (props.editGrade) {
            await store.updateGrade(props.editGrade.id, { ...form.value });
        } else {
            await store.addGrade({ ...form.value });
        }
        emit("saved");
    } catch {
        error.value = "Errore durante il salvataggio. Riprova.";
    } finally {
        saving.value = false;
    }
}
</script>
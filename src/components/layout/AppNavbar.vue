<template>
    <nav class="navbar is-white has-shadow" role="navigation">
        <div class="navbar-brand">
            <router-link to="/dashboard" class="navbar-item has-text-primary has-text-weight-bold is-size-5">
                <span class="icon mr-2"><i class="fas fa-book-open"></i></span>
                Registro Voti
            </router-link>
            <button class="navbar-burger" :class="{ 'is-active': menuOpen }" @click="menuOpen = !menuOpen">
                <span></span><span></span><span></span>
            </button>
        </div>

        <div class="navbar-menu" :class="{ 'is-active': menuOpen }">
            <div class="navbar-start">
                <router-link to="/dashboard" class="navbar-item" @click="menuOpen = false">
                    <span class="icon mr-1"><i class="fas fa-house"></i></span> Dashboard
                </router-link>
                <router-link to="/import" class="navbar-item" @click="menuOpen = false">
                    <span class="icon mr-1"><i class="fas fa-wand-magic-sparkles"></i></span> Importa
                </router-link>
                <router-link to="/stats" class="navbar-item" @click="menuOpen = false">
                    <span class="icon mr-1"><i class="fas fa-chart-simple"></i></span> Statistiche
                </router-link>
                <router-link to="/goal" class="navbar-item" @click="menuOpen = false">
                    <span class="icon mr-1"><i class="fas fa-bullseye"></i></span> Obiettivo
                </router-link>
                <router-link to="/projection" class="navbar-item" @click="menuOpen = false">
                    <span class="icon mr-1"><i class="fas fa-arrow-trend-up"></i></span> Proiezione
                </router-link>
                <router-link to="/settings" class="navbar-item" @click="menuOpen = false">
                    <span class="icon mr-1"><i class="fas fa-gear"></i></span> Impostazioni
                </router-link>

                <div class="navbar-item">
                    <div class="buttons has-addons">
                        <button class="button is-small" :class="ui.selectedPeriod === 'all' ? 'is-primary' : 'is-light'"
                            @click="ui.setPeriod('all')">Tutto</button>
                        <button class="button is-small" :class="ui.selectedPeriod === 'Q1' ? 'is-primary' : 'is-light'"
                            @click="ui.setPeriod('Q1')">Q1</button>
                        <button class="button is-small" :class="ui.selectedPeriod === 'Q2' ? 'is-primary' : 'is-light'"
                            @click="ui.setPeriod('Q2')">Q2</button>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref } from "vue";
const menuOpen = ref(false);

import { useGradesStore } from '@/stores/grades';
const store = useGradesStore();

import { useUiStore } from '@/stores/ui';
const ui = useUiStore();
</script>

<style scoped>
.navbar-item.router-link-active {
    color: #3273dc !important;
    font-weight: 600;
    background: #f0f4ff;
}
</style>
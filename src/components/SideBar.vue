<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const expanded = ref(false)
</script>

<template>
    <div class="sidebar" :class="{ expanded }" @mouseenter="expanded = true" @mouseleave="expanded = false">
        <div class="sidebar-content">
            <RouterLink class="menu-item text-decoration-none text-white fw-semibold" to="/">
                <span class="icon">🏠</span>
                <span class="text">Inicio</span>
            </RouterLink>
            <RouterLink class="menu-item text-decoration-none text-white fw-semibold" to="/documentos">
                <span class="icon">📄</span>
                <span class="text">Documentos</span>
            </RouterLink>
            <RouterLink class="menu-item text-decoration-none text-white fw-semibold" to="/configuracion">
                <span class="icon">⚙️</span>
                <span class="text">Configuración</span>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.sidebar {
    position: fixed;
    top: 7vh;
    left: 0;
    height: 90vh;
    width: 2.5vw;
    min-width: 48px;
    max-width: 220px;
    background: linear-gradient(90deg, rgba(34, 34, 34, 0.85) 70%, rgba(34, 34, 34, 0.18) 100%);
    color: #e2c94c;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, box-shadow 0.3s;
    overflow-x: hidden;
    z-index: 1000;
    box-shadow: 0.2vw 0 1vw 0.1vw rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2vh;
    border-radius: 0.7vw;
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(4px);
}

.sidebar.expanded {
    width: 10vw;
    min-width: 120px;
    background: linear-gradient(90deg, rgba(34, 34, 34, 0.93) 80%, rgba(34, 34, 34, 0.10) 100%);
    box-shadow: 0.2vw 0 2vw 0.2vw rgba(255, 217, 28, 0.08);
}

@media (max-width: 900px) {
    .sidebar {
        width: 8vw;
        min-width: 40px;
    }

    .sidebar.expanded {
        width: 40vw;
        min-width: 120px;
    }
}

@media (max-width: 600px) {
    .sidebar {
        position: fixed;
        top: 7vh;
        left: 0;
        width: 0;
        min-width: 0;
        height: 0;
        border: none;
        box-shadow: none;
        background: transparent;
        pointer-events: none;
    }

    .sidebar.expanded {
        width: 60vw;
        min-width: 120px;
        height: calc(100vh - 7vh);
        background: #232323ee;
        pointer-events: auto;
        box-shadow: 0.2vw 0 1vw 0.1vw rgba(255, 217, 28, 0.10);
        backdrop-filter: blur(8px);
    }
}

.sidebar-content {
    width: 100%;
    margin-top: 2vh;
    display: flex;
    flex-direction: column;
    gap: 2vh;
}

.menu-item {
    padding: 1vh 0.6vw;
    border-radius: 0.6vw;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-left: 3px solid transparent;
    font-size: 0.98rem;
}

.menu-item .icon {
    font-size: 1.7vh;
    color: #e2c94c;
    filter: none;
    margin-right: 0.18vw;
}

.menu-item .text {
    margin-left: 0.3vw;
    margin-right: 0.2vw;
    transition: opacity 0.2s, width 0.2s;
    white-space: nowrap;
    overflow: hidden;
    color: #fffbe6;
    font-weight: 500;
    letter-spacing: 0.01em;
    font-size: 0.97rem;
}

.sidebar:not(.expanded) .menu-item .text {
    opacity: 0;
    width: 0;
    margin-left: 0;
    pointer-events: none;
}

.sidebar.expanded .menu-item {
    justify-content: flex-start;
}

.menu-item:hover,
.menu-item.router-link-exact-active {
    background: rgba(255, 221, 28, 0.08);
    color: #ffd91c;
    border-left: 3px solid #ffd91c;
    border-bottom: 2.5px solid #232323;
    box-shadow: none;
}

.menu-item:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
}
</style>

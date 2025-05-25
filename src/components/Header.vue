<script setup>
import { ref, computed, onMounted } from 'vue'

const logoSrc = ref('/public/favicon2.png')
const hasToken = ref(!!sessionStorage.getItem('token'))
const userInfo = ref(null)
const isDarkMode = ref(false) // Default to light mode

function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light'); // Or localStorage.removeItem('theme') if light is default
    }
}

function onLogoEnter() {
    logoSrc.value = '/public/favicon3.png'
}
function onLogoLeave() {
    logoSrc.value = '/public/favicon2.png'
}

function updateTokenStatus() {
    hasToken.value = sessionStorage.getItem('token') !== null;
    if (hasToken.value) {
        try {
            userInfo.value = JSON.parse(sessionStorage.getItem('user'))
        } catch {
            userInfo.value = null
        }
    } else {
        userInfo.value = null
    }
}

window.addEventListener('storage', updateTokenStatus)
window.addEventListener('token-changed', updateTokenStatus)

function logout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    hasToken.value = false
    userInfo.value = null
    window.dispatchEvent(new Event('token-changed'))
    window.location.reload()
}

const userAvatar = computed(() => {
    if (userInfo.value && userInfo.value.foto) {
        if (userInfo.value.foto.startsWith('http')) return userInfo.value.foto
        if (userInfo.value.foto.startsWith('storage/')) return 'http://localhost:8080/' + userInfo.value.foto
        return '/' + userInfo.value.foto.replace(/^public\//, '')
    }
    return '/icons/favicon.svg'
})

onMounted(() => {
    updateTokenStatus(); // Keep existing onMounted logic

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === null) {
        // No theme preference found, default to dark mode
        isDarkMode.value = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        // Optionally, save this default to localStorage so it's "sticky" until changed
        // localStorage.setItem('theme', 'dark'); 
    } else if (savedTheme === 'dark') {
        isDarkMode.value = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    } else { // savedTheme === 'light'
        isDarkMode.value = false;
        document.documentElement.removeAttribute('data-theme');
    }
})
</script>

<template>
    <nav class="navbar navbar-expand-md navbar-dark">
        <div class="container-fluid container pb-3">
            <!-- Parte Izquierda -->
            <a class="navbar-brand d-flex align-items-center ml-5" href="/" @mouseenter="onLogoEnter"
                @mouseleave="onLogoLeave">
                <img :src="logoSrc" width="32" alt="Logo" />
                <span class="fw-semibold fs-4">POMSE</span>
            </a>
            <!-- Theme Toggle Button -->
            <button id="theme-toggle-btn" class="btn btn-sm ms-2" @click="toggleTheme">
                {{ isDarkMode ? '🌙' : '☀️' }}
            </button>
            <!-- Parte Derecha -->
            <div class="collapse navbar-collapse justify-content-end">
                <ul class="navbar-nav mb-md-0">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown"
                            role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="avatar-img-header">
                                <img :src="userAvatar" alt="avatar" width="36" height="36" />
                            </span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <template v-if="hasToken">
                                <li>
                                    <a class="dropdown-item" href="/profile">Mi perfil</a>
                                </li>
                                <li>
                                    <button class="dropdown-item text-danger" @click="logout">Cerrar sesión</button>
                                </li>
                            </template>
                            <template v-else>
                                <li>
                                    <a class="dropdown-item" href="/login">Identificarse</a>
                                </li>
                            </template>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.container {
    max-width: 190vh;
}

.navbar {
    /* background: linear-gradient(to bottom, #222 73%, black 80%, transparent 93%); */
    background: var(--color-header-background); /* Updated to use CSS variable */
    height: 9vh;
    min-height: 48px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    z-index: 1050;
}

@media (max-width: 600px) {
    .navbar {
        height: 6vh;
        min-height: 40px;
        padding: 0 1vw;
    }

    .navbar-brand span {
        font-size: 1.1rem;
    }

    .navbar-brand img {
        width: 24px;
    }
}

.navbar .navbar-brand,
.navbar .nav-link,
.navbar span { /* This affects the POMSE brand text and nav links */
    color: var(--color-header-text) !important; /* Updated */
}

.avatar-img-header {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-background); /* Use a background that contrasts with avatar */
    overflow: hidden;
    border: 1px solid var(--color-border); /* Add a subtle border */
    margin-right: 0.5em;
}

.avatar-img-header img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.dropdown-menu {
    background: var(--color-card-background);
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.dropdown-item {
    color: var(--color-text);
    transition: background 0.18s, color 0.18s;
}

.dropdown-item:hover,
.dropdown-item:focus {
    background: var(--color-background); /* Use a slightly different background for hover */
    color: var(--color-primary);
}

.dropdown-item.text-danger {
    color: var(--color-danger); /* Updated to use CSS variable */
}

#theme-toggle-btn {
    color: var(--color-header-text); 
    border-color: var(--color-header-text);
    background-color: transparent; /* Ensure button background is initially transparent */
    font-size: 1rem; 
    padding: 0.25rem 0.5rem;
}

#theme-toggle-btn:hover {
    color: var(--color-header-background); /* Text color becomes header background */
    background-color: var(--color-header-text); /* Background becomes header text color */
    border-color: var(--color-header-text);
}
</style>

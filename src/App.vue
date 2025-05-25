<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from './components/Header.vue';
import TopMenu from './components/TopMenu.vue';

const theme = ref(localStorage.getItem('theme') || 'dark')

function setTheme(newTheme) {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
}

onMounted(async () => {
  if (!sessionStorage.getItem('token')) return;
  try {
    const response = await fetch('http://localhost:8080/api/check-token', {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      sessionStorage.removeItem('token');
      window.location.reload();
    }
  } catch (e) {
    sessionStorage.removeItem('token');
    window.location.reload();
  }
});

const isLogged = ref(!!sessionStorage.getItem('token'))

window.addEventListener('storage', () => {
  isLogged.value = !!sessionStorage.getItem('token')
})

const router = useRouter()

router.afterEach(() => {
  isLogged.value = !!sessionStorage.getItem('token')
})
</script>

<template>
  <div class="body">
    <Header class="fixed-top" />
    <TopMenu v-if="isLogged" />
    <div class="main-layout">
      <div class="main-content">
        <RouterView class="layout" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.body {
  background: #F4F4F4;
  color: white;
  min-height: 100vh;
  overflow: hidden;
  padding-top: 13vh;
  /* deja espacio para el header fijo */
}


.main-content {
  flex: 1;
  margin-left: 2.5vw;
  transition: margin-left 0.2s;
}

@media (max-width: 900px) {
  .main-content {
    margin-left: 8vw;
  }
}

@media (max-width: 600px) {
  .main-content {
    margin-left: 0;
  }
}

.layout {
  background-color: transparent;
  color: white;
}
</style>

<script setup>
import { onMounted, ref } from 'vue'
import Header from './components/Header.vue';
import SideBar from './components/SideBar.vue';

const theme = ref(localStorage.getItem('theme') || 'dark')

function setTheme(newTheme) {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
}

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/api/check-token', {
      headers: {
        'Authorization': sessionStorage.getItem('token') ? `Bearer ${sessionStorage.getItem('token')}` : ''
      }
    });
    if (!response.ok) {
      sessionStorage.removeItem('token');
    }
  } catch (e) {
    sessionStorage.removeItem('token');
  }
});
</script>

<template>
  <div class="body">
    <Header class="fixed-top" />
    <div class="main-layout">
      <SideBar />
      <div class="main-content">
        <RouterView class="layout" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.body {
  background: #161515;
  color: white;
  min-height: 100vh;
  overflow: hidden;
  padding-top: 9vh;
  /* deja espacio para el header fijo */
}


.main-content {
  flex: 1;
  margin-left: 2.5vw;
  transition: margin-left 0.2s;
}

.sidebar.expanded~.main-content {
  margin-left: 10vw;
}

@media (max-width: 900px) {
  .main-content {
    margin-left: 8vw;
  }

  .sidebar.expanded~.main-content {
    margin-left: 40vw;
  }
}

@media (max-width: 600px) {
  .main-content {
    margin-left: 0;
  }

  .sidebar.expanded~.main-content {
    margin-left: 60vw;
  }
}

.layout {
  background-color: transparent;
  color: white;
}
</style>

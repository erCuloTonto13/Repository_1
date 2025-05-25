<script setup>
import Cards from '../components/Cards.vue'
import FriendsList from '../components/FriendsList.vue';
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const isLogged = ref(!!sessionStorage.getItem('token'))

function goToCrearPost() {
  router.push('/crearPost')
}

window.addEventListener('storage', () => {
  isLogged.value = !!sessionStorage.getItem('token')
})
</script>

<template>
  <div class="center">
    <Cards />
  </div>
  <div id="friends">
    <FriendsList />
  </div>
  <div v-if="isLogged" class="crear-post-fab" @click="goToCrearPost" title="Crear nuevo post">
    <span class="fab-icon">+</span>
  </div>
</template>

<style scoped>
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#friends {
  text-align: center;
}

.crear-post-fab {
  position: fixed;
  right: 2.5vw;
  bottom: 2.5vw;
  width: 54px;
  height: 54px;
  color: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 12px #0003;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2000;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.crear-post-fab:hover {
  color: #121212;
  box-shadow: 0 4px 18px #0004;
}

.fab-icon {
  font-size: 2.1em;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

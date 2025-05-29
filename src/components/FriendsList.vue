<script setup>
import axios from 'axios';
import { onMounted, ref, onUnmounted } from 'vue';

axios.defaults.baseURL = 'http://localhost:8080/api/';
let friends = ref([])
let pendingRequests = ref([])
let loadingFriends = ref(true)
let noFriendsMsg = ref('')

let searchQuery = ref('')
let searchResults = ref([])
let searching = ref(false)
let searchError = ref('')

// Estado para controlar el hover de cada amigo
let hoveredFriendIndex = ref(null)
let activeTab = ref('amigos')

async function fetchFriendInfo(id) {
  let token = sessionStorage.getItem('token')
  try {
    let response = await axios.get(`users/${id}`,
      token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined
    )
    return response.data
  } catch {
    return null
  }
}

function resetFriends() {
  friends.value = []
  pendingRequests.value = []
  noFriendsMsg.value = 'Descubre a gente nueva'
  loadingFriends.value = false
}

async function loadFriends() {
  let token = sessionStorage.getItem('token')
  if (!token) {
    resetFriends()
    return
  }
  loadingFriends.value = true
  try {
    let response = await axios.get('friendshipsOfUser', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    let data = response.data
    let usuario_id = null
    try {
      usuario_id = JSON.parse(atob(token.split('.')[1])).sub
    } catch { }
    if (Array.isArray(data) && data.length > 0) {
      // Amigos aceptados
      let accepted = data.filter(friend => String(friend.accepted) === '1').slice(0, 50)
      if (accepted.length > 0) {
        // Obtener todos los usuarios de una sola vez
        let usersResp = await axios.get('users', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        let allUsers = Array.isArray(usersResp.data) ? usersResp.data : []
        // Hacer match localmente usando amigo_id
        let friendInfos = accepted.map(friend => {
          // Buscar el usuario que NO es el actual (usuario_id)
          let amigoRealId = String(friend.usuario_id) === String(usuario_id)
            ? friend.amigo_id
            : friend.usuario_id;
          // Si el usuario actual es ambos (caso raro), mostrar el otro
          if (String(friend.usuario_id) === String(friend.amigo_id)) {
            amigoRealId = friend.amigo_id;
          }
          const info = allUsers.find(u => String(u.id) == String(amigoRealId))
          if (!info) return null
          return {
            ...info,
            amigo_id: amigoRealId,
            friendship_id: friend.id
          }
        })
        friends.value = friendInfos.filter(Boolean)
        noFriendsMsg.value = ''
      } else {
        friends.value = []
      }
    } else {
      resetFriends()
    }
  } catch (e) {
    resetFriends()
  } finally {
    loadingFriends.value = false
  }
}

async function loadPendingRequests() {
  let token = sessionStorage.getItem('token')
  if (!token) {
    pendingRequests.value = []
    return
  }
  loadingFriends.value = true
  try {
    // Obtener todas las relaciones de amistad
    let response = await axios.get('friendshipsOfUser', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    let data = response.data
    let usuario_id = null
    try {
      usuario_id = JSON.parse(atob(token.split('.')[1])).sub
    } catch { }
    if (Array.isArray(data) && data.length > 0) {
      let pending = data.filter(friend =>
        String(friend.accepted) === '0' &&
        String(friend.amigo_id) == String(usuario_id) &&
        String(friend.solicitante_id) !== String(usuario_id)
      ).slice(0, 50)
      if (pending.length > 0) {
        // Obtener todos los usuarios de una sola vez
        let usersResp = await axios.get('users', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        let allUsers = Array.isArray(usersResp.data) ? usersResp.data : []
        // Hacer match localmente usando usuario_id (quien envió la solicitud)
        let pendingWithInfo = pending.map(friend => {
          const info = allUsers.find(u => String(u.id) == String(friend.usuario_id))
          if (!info) return null
          return {
            ...info,
            amigo_id: friend.usuario_id, // el que envió la solicitud
            friendship_id: friend.id
          }
        })
        pendingRequests.value = pendingWithInfo.filter(Boolean)
      } else {
        pendingRequests.value = []
      }
    } else {
      pendingRequests.value = []
    }
  } catch (e) {
    pendingRequests.value = []
  } finally {
    loadingFriends.value = false
  }
}

async function acceptFriend(amigo_id) {
  const token = sessionStorage.getItem('token')
  try {
    await axios.put(`acceptFriendship/${amigo_id}`, {}, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    await loadFriends()
  } catch (e) {
    alert(e.response?.data?.error || 'Error al aceptar la amistad.')
  }
}

async function searchUsers() {
  searchError.value = ''
  searchResults.value = []
  if (!searchQuery.value.trim()) {
    return
  }
  searching.value = true
  try {
    const token = sessionStorage.getItem('token')
    let response = await axios.get('searchUser', {
      params: { usuario: searchQuery.value },
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    searchResults.value = Array.isArray(response.data) ? response.data : []
    if (!searchResults.value.length) {
      searchError.value = 'No se encontraron usuarios.'
    }
  } catch (e) {
    searchError.value = e.response?.data?.mensaje || 'Error al buscar usuarios.'
  } finally {
    searching.value = false
  }
}

onMounted(() => {
  loadFriends()
  loadPendingRequests()
  window.addEventListener('token-changed', () => {
    loadFriends()
    loadPendingRequests()
  })
})
onUnmounted(() => {
  window.removeEventListener('token-changed', loadFriends)
})
</script>

<template>
  <aside class="friends-list-aside">
    <!-- BUSCADOR DE USUARIOS -->
    <div class="friends-search-header">
      <h2 class="friends-list-title">Buscar usuario</h2>
      <form class="friends-search-form" @submit.prevent="searchUsers">
        <input v-model="searchQuery" @keyup.enter="searchUsers" type="text" placeholder="Buscar por nombre o usuario"
          class="friends-search-input" />
        <button type="submit" class="friends-search-btn" :disabled="searching">
          <i class="bi bi-search"></i>
        </button>
      </form>
    </div>
    <div class="friends-search-results-rect">
      <div v-if="searching" class="search-loading">Buscando...</div>
      <div v-else-if="searchError" class="search-error">{{ searchError }}</div>
      <div v-else-if="searchResults.length">
        <div v-for="user in searchResults" :key="user.id" class="user-card-rect">
          <div class="user-card-img">
            <img :src="user.foto
              ? (user.foto.startsWith('http')
                ? user.foto
                : (user.foto.startsWith('storage/')
                  ? 'http://localhost:8080/' + user.foto
                  : '/' + user.foto.replace(/^public\//, '')))
              : '/icons/favicon.svg'" alt="avatar" width="48" height="48" />
          </div>
          <div class="user-card-name">
            {{ user.usuario || user.nombre || user.name || 'Usuario' }}
          </div>
          <button class="user-card-add-btn" title="Agregar amigo">
            <i class="bi bi-person-plus-fill"></i>
          </button>
        </div>
      </div>
      <div v-else class="search-placeholder">Busca usuarios para agregarlos como amigos.</div>
    </div>
    <!-- LISTA DE AMIGOS CON TABS -->
    <div class="friends-list-header">
      <ul class="nav nav-tabs nav-tabs-friends" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ active: activeTab === 'amigos' }" @click="activeTab = 'amigos'"
            type="button" role="tab">
            Amigos
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ active: activeTab === 'solicitudes' }" @click="activeTab = 'solicitudes'"
            type="button" role="tab">
            Solicitudes
          </button>
        </li>
      </ul>
    </div>
    <div class="friends-list-rect">
      <!-- TAB: AMIGOS -->
      <div v-if="activeTab === 'amigos'">
        <div v-for="(friend, index) in friends" :key="index" class="user-card-rect"
          @mouseenter="hoveredFriendIndex = index" @mouseleave="hoveredFriendIndex = null">
          <div class="user-card-img">
            <img :src="friend.foto
              ? (friend.foto.startsWith('http')
                ? friend.foto
                : (friend.foto.startsWith('storage/')
                  ? 'http://localhost:8080/' + friend.foto
                  : '/' + friend.foto.replace(/^public\//, '')))
              : '/icons/favicon.svg'" alt="avatar" width="48" height="48" />
          </div>
          <div class="user-card-name">
            {{ friend.usuario || friend.nombre || friend.name || 'Amigo' }}
          </div>
          <button v-if="hoveredFriendIndex === index" class="user-card-remove-btn" title="Eliminar amigo">
            <i class="bi bi-person-x-fill"></i>
          </button>
          <span v-else class="user-card-friend-icon" title="Amigo">
            <i class="bi bi-person-check-fill"></i>
          </span>
        </div>
        <div v-if="!loadingFriends && !friends.length && noFriendsMsg" class="no-friends-msg">{{ noFriendsMsg }}</div>
      </div>
      <!-- TAB: SOLICITUDES -->
      <div v-else>
        <div v-for="(user, idx) in pendingRequests" :key="idx" class="user-card-rect">
          <div class="user-card-img">
            <img :src="user.foto
              ? (user.foto.startsWith('http')
                ? user.foto
                : (user.foto.startsWith('storage/')
                  ? 'http://localhost:8080/' + user.foto
                  : '/' + user.foto.replace(/^public\//, '')))
              : '/icons/favicon.svg'" alt="avatar" width="48" height="48" />
          </div>
          <div class="user-card-name">
            {{ user.usuario || user.nombre || user.name || 'Usuario' }}
          </div>
          <button class="user-card-add-btn user-card-outline-btn" title="Aceptar solicitud"
            @click="acceptFriend(user.amigo_id)">
            <i class="bi bi-person-check"></i>
          </button>
        </div>
        <div v-if="!loadingFriends && !pendingRequests.length" class="no-friends-msg">No tienes solicitudes pendientes.
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.friends-list-aside {
  background: black;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  padding-bottom: 0.5rem;
  padding-top: 0.7rem;
  position: relative;
  color: #8E44FF;
  z-index: 10;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  min-width: 240px;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  height: 95vh;
  max-height: 95vh;
  overflow: hidden;
}

.friends-search-header {
  padding: 0 1.2rem 0.5rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
}

.friends-list-header {
  padding-left: 1.2rem;
  padding-right: 1.2rem;
  color: #bfa600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.7em;
}

.friends-list-title {
  text-transform: uppercase;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.04em;
}

.friends-search-form {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.2em;
}

.friends-search-input {
  flex: 1;
  border-radius: 6px;
  border: 1.5px solid #8E44FF;
  padding: 0.45em 0.9em;
  font-size: 1em;
  background: #181818;
  color: #fff;
  outline: none;
  transition: border 0.18s;
}

.friends-search-input:focus {
  border-color: #00FFC6;
}

.friends-search-btn {
  background: #8E44FF;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.45em 0.9em;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friends-search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.friends-search-btn:hover {
  background: #00FFC6;
  color: #181818;
}

.friends-search-results-rect {
  max-height: 28vh;
  min-height: 6vh;
  overflow-y: auto;
  padding: 0.5em 1.2rem 0.5em 1.2rem;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}

.friends-list-rect {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0.5em 1.2rem 1.2em 1.2rem;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
  min-height: 0;
  max-height: calc(95vh - 28vh - 8.5em);
}

.search-loading,
.search-error,
.search-placeholder {
  color: #fffbe6;
  font-size: 1em;
  text-align: center;
  padding: 0.5em 0.2em;
}

.user-card-rect {
  display: flex;
  align-items: center;
  background: #181818;
  border-radius: 10px;
  box-shadow: 0 2px 8px #8e44ff22;
  padding: 0.5em 1em;
  gap: 1em;
  margin-bottom: 0.2em;
  min-height: 56px;
  transition: box-shadow 0.18s, background 0.18s;
}

.user-card-rect:hover {
  background: #232323;
  box-shadow: 0 4px 16px #8e44ff44;
}

.user-card-img img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #161515;
  border: 2px solid #8E44FF44;
}

.user-card-name {
  flex: 1;
  color: #fff;
  font-size: 1.07em;
  font-weight: 500;
  margin-left: 0.2em;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-card-add-btn,
.user-card-friend-icon,
.user-card-remove-btn {
  background: #8E44FF;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25em;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px #8e44ff33;
}

.user-card-add-btn:hover {
  background: #00FFC6;
  color: #181818;
}

.user-card-friend-icon {
  pointer-events: none;
  background: #232323;
  color: #00FFC6;
  border: 2px solid #00FFC6;
}

.user-card-remove-btn {
  background: #ff2d2d;
  color: #fff;
  border: 2px solid #ff2d2d;
}

.user-card-remove-btn:hover {
  background: #fff;
  color: #ff2d2d;
  border: 2px solid #ff2d2d;
}

.user-card-outline-btn {
  background: transparent;
  color: #fff;
  border: 2px solid #181818;
  box-shadow: none;
}

.user-card-outline-btn:hover {
  background: #fff;
  color: #181818;
}

.no-friends-msg {
  color: #fffbe6;
  font-size: 1em;
  text-align: center;
  padding: 0.7em 0.2em;
  padding-left: 1.2rem;
  padding-right: 1.2rem;
}

.nav-tabs-friends {
  border-bottom: 1px solid #8E44FF;
  margin-bottom: 0.5em;
  background: transparent;
}

.nav-tabs-friends .nav-link {
  color: #fff;
  background: none;
  border: none;
  border-radius: 0.7em 0.7em 0 0;
  font-weight: 600;
  font-size: 1em;
  padding: 0.5em 1.2em;
  margin-right: 0.2em;
  transition: background 0.18s, color 0.18s;
}

.nav-tabs-friends .nav-link.active,
.nav-tabs-friends .nav-link:hover {
  background: #8E44FF;
  color: #fff;
}

@media (max-width: 600px) {
  .friends-list-aside {
    min-width: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .friends-list-rect {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .user-card-rect {
    min-width: 56px;
    max-width: 100vw;
  }

  .user-card-name {
    font-size: 0.95em;
    max-width: 56vw;
  }
}
</style>
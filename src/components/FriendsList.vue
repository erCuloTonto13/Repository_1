<script setup>
import axios from 'axios';
import { onMounted, ref, onUnmounted } from 'vue';

axios.defaults.baseURL = 'http://localhost:8080/api/';
let friends = ref([])
let loadingFriends = ref(true)
let noFriendsMsg = ref('')

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
    if (Array.isArray(data) && data.length > 0) {
      let accepted = data.filter(friend => String(friend.accepted) === '1').slice(0, 5)
      if (accepted.length > 0) {
        let friendInfos = await Promise.all(
          accepted.map(friend => fetchFriendInfo(friend.amigo_id))
        )
        friends.value = friendInfos.filter(Boolean)
        noFriendsMsg.value = ''
      } else {
        resetFriends()
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

onMounted(() => {
  loadFriends()
  window.addEventListener('token-changed', loadFriends)
})
onUnmounted(() => {
  window.removeEventListener('token-changed', loadFriends)
})
</script>

<template>
  <aside class="friends-list-aside" aria-label="Tus amigos">
    <div class="friends-list-header">
      <h2 class="friends-list-title">Tus amigos</h2>
    </div>
    <ul v-if="!loadingFriends && friends.length > 0" class="friends-list-ul">
      <li v-for="(friend, index) in friends" :key="index" class="friends-list-li">
        <a class="friend-link" href="#">
          <span class="friend-avatar">
            <span class="avatar-img">
              <img :src="friend.foto
                ? (friend.foto.startsWith('http')
                  ? friend.foto
                  : (friend.foto.startsWith('storage/')
                    ? 'http://localhost:8080/' + friend.foto
                    : '/' + friend.foto.replace(/^public\//, '')))
                : '/icons/favicon.svg'" alt="avatar" width="32" height="32" />
            </span>
          </span>
          <span class="friend-info">
            <span class="friend-name">{{ friend.usuario || friend.nombre || friend.name || 'Amigo' }}</span>
          </span>
        </a>
      </li>
    </ul>
    <div v-else-if="!loadingFriends && !friends.length && noFriendsMsg" class="no-friends-msg">{{ noFriendsMsg }}</div>
  </aside>
</template>

<style scoped>
.friends-list-aside {
  background: black;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  padding-bottom: 0.5rem;
  padding-top: 0.7rem;
  position: fixed;
  right: 2vw;
  top: 50%;
  transform: translateY(-50%);
  min-width: 240px;
  max-width: 320px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  color: #8E44FF;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.friends-list-header {
  padding-left: 1.2rem;
  padding-right: 1.2rem;
  color: #bfa600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.friends-list-title {
  text-transform: uppercase;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.04em;
}

.friends-list-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friends-list-li {
  position: relative;
  margin-top: 0;
  list-style: none;
}

.friend-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.7rem;
  padding: 0.5rem 1.2rem;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.18s, color 0.18s;
  cursor: pointer;
}

.friend-link:hover {
  background: #2c2c2c;
  color: #fff;
}

.friend-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  width: 2.2rem;
  min-width: 2.2rem;
  min-height: 2.2rem;
}

.avatar-img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #161515;
  overflow: hidden;
}

.avatar-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.friend-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  justify-content: center;
}

.friend-name {
  font-size: 1.08rem;
  color: white;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-friends-msg {
  color: #fffbe6;
  font-size: 1em;
  text-align: center;
  padding: 0.7em 0.2em;
  padding-left: 1.2rem;
  padding-right: 1.2rem;
}
</style>
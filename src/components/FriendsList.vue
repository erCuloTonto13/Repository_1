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
  <aside class="friends-list-aside">
    <div class="friends-list-header">
      <h2 class="friends-list-title">Tus amigos</h2>
    </div>
    <div class="friends-stories-scroll">
      <div v-for="(friend, index) in friends" :key="index" class="friend-story-item">
        <a class="friend-story-link" href="#">
          <span class="friend-story-avatar">
            <img :src="friend.foto
              ? (friend.foto.startsWith('http')
                ? friend.foto
                : (friend.foto.startsWith('storage/')
                  ? 'http://localhost:8080/' + friend.foto
                  : '/' + friend.foto.replace(/^public\//, '')))
              : '/icons/favicon.svg'" alt="avatar" width="56" height="56" />
          </span>
          <span class="friend-story-name">{{ friend.usuario || friend.nombre || friend.name || 'Amigo' }}</span>
        </a>
      </div>
      <div v-if="!loadingFriends && !friends.length && noFriendsMsg" class="no-friends-msg">{{ noFriendsMsg }}</div>
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

.friends-stories-scroll {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 1.2rem;
  padding: 1.1rem 1.2rem 0.7rem 1.2rem;
  scrollbar-width: thin;
  scrollbar-color: #8E44FF #181818;
}

.friends-stories-scroll::-webkit-scrollbar {
  height: 7px;
}

.friends-stories-scroll::-webkit-scrollbar-thumb {
  background: #8E44FF;
  border-radius: 4px;
}

.friend-story-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  max-width: 80px;
}

.friend-story-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #fff;
  gap: 0.3em;
}

.friend-story-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8E44FF 60%, #00FFC6 100%);
  padding: 2.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.2em;
  box-shadow: 0 2px 8px #8E44FF22;
  transition: box-shadow 0.18s;
}

.friend-story-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background: #161515;
  border: 2px solid #181818;
}

.friend-story-link:hover .friend-story-avatar {
  box-shadow: 0 4px 16px #8E44FF66;
}

.friend-story-name {
  font-size: 0.98em;
  color: #fff;
  font-weight: 500;
  text-align: center;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-friends-msg {
  color: #fffbe6;
  font-size: 1em;
  text-align: center;
  padding: 0.7em 0.2em;
  padding-left: 1.2rem;
  padding-right: 1.2rem;
}

@media (max-width: 600px) {
  .friends-list-aside {
    min-width: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .friends-stories-scroll {
    gap: 0.7rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .friend-story-item {
    min-width: 56px;
    max-width: 70px;
  }

  .friend-story-name {
    font-size: 0.85em;
    max-width: 56px;
  }
}
</style>
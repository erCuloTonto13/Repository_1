<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8080/api/'

const router = useRouter()
const userInfo = ref(null)
const userPosts = ref([])
const loadingPosts = ref(true)
const noPostsMsg = ref('')
const userLikes = ref([])
const loadingLikes = ref(true)
const noLikesMsg = ref('')
const userSaveds = ref([])
const loadingSaveds = ref(true)
const noSavedsMsg = ref('')
const userFriends = ref([])
const loadingFriends = ref(true)

onMounted(async () => {
    try {
        userInfo.value = JSON.parse(sessionStorage.getItem('user'))
        if (!userInfo.value) router.push('/login')
        else {
            loadingPosts.value = true
            const token = sessionStorage.getItem('token')
            // Llamada a la API personalizada para obtener los posts del usuario
            const res = await axios.get('viewPostOfUser', token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
            if (Array.isArray(res.data)) {
                userPosts.value = res.data
                if (userPosts.value.length === 0) noPostsMsg.value = 'No hay posts.'
            } else {
                userPosts.value = []
                noPostsMsg.value = 'No hay posts.'
            }
        }
    } catch {
        userInfo.value = null
        router.push('/login')
    } finally {
        loadingPosts.value = false
    }
})

onMounted(async () => {
    try {
        userInfo.value = JSON.parse(sessionStorage.getItem('user'))
        if (!userInfo.value) router.push('/login')
        else {
            loadingPosts.value = true
            const token = sessionStorage.getItem('token')
            // Llamada a la API personalizada para obtener los posts del usuario
            const res = await axios.get('viewPostOfUser', token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
            if (Array.isArray(res.data)) {
                userPosts.value = res.data
                if (userPosts.value.length === 0) noPostsMsg.value = 'No hay posts.'
            } else {
                userPosts.value = []
                noPostsMsg.value = 'No hay posts.'
            }
        }
    } catch {
        userInfo.value = null
        router.push('/login')
    } finally {
        loadingPosts.value = false
    }
    fetchUserLikes()
    fetchUserSaveds()
    fetchUserFriends()
})

async function fetchUserLikes() {
    loadingLikes.value = true
    try {
        const token = sessionStorage.getItem('token')
        const res = await axios.get('likesOfUser', token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
        if (Array.isArray(res.data)) {
            // Para cada like, obtener la info del post
            const postPromises = res.data.map(async (like) => {
                try {
                    const postRes = await axios.get(`posts/${like.post_id}`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
                    // Si la API devuelve el post como objeto directo
                    return postRes.data
                } catch {
                    return null
                }
            })
            const posts = await Promise.all(postPromises)
            userLikes.value = posts.filter(Boolean)
            if (userLikes.value.length === 0) noLikesMsg.value = 'No hay likes.'
        } else {
            userLikes.value = []
            noLikesMsg.value = 'No hay likes.'
        }
    } catch {
        userLikes.value = []
        noLikesMsg.value = 'No hay likes.'
    } finally {
        loadingLikes.value = false
    }
}

async function fetchUserSaveds() {
    loadingSaveds.value = true
    try {
        const token = sessionStorage.getItem('token')
        // Cambiar endpoint a 'savedsOfUser' según la instrucción
        const res = await axios.get('savedsOfUser', token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
        if (Array.isArray(res.data)) {
            // Para cada saved, obtener la info del post
            const postPromises = res.data.map(async (saved) => {
                try {
                    const postRes = await axios.get(`posts/${saved.post_id}`, token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
                    return postRes.data
                } catch {
                    return null
                }
            })
            const posts = await Promise.all(postPromises)
            userSaveds.value = posts.filter(Boolean)
            if (userSaveds.value.length === 0) noSavedsMsg.value = 'No hay guardados.'
        } else {
            userSaveds.value = []
            noSavedsMsg.value = 'No hay guardados.'
        }
    } catch {
        userSaveds.value = []
        noSavedsMsg.value = 'No hay guardados.'
    } finally {
        loadingSaveds.value = false
    }
}

async function fetchUserFriends() {
    loadingFriends.value = true
    try {
        const token = sessionStorage.getItem('token')
        const res = await axios.get('friendshipsOfUser', token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
        if (Array.isArray(res.data)) {
            userFriends.value = res.data
        } else {
            userFriends.value = []
        }
    } catch {
        userFriends.value = []
    } finally {
        loadingFriends.value = false
    }
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
    window.addEventListener('focus', updateUserInfo)
})
onUnmounted(() => {
    window.removeEventListener('focus', updateUserInfo)
})

async function updateUserInfo() {
    try {
        const token = sessionStorage.getItem('token')
        const res = await axios.get('me', { headers: { 'Authorization': `Bearer ${token}` } })
        if (res.data) {
            sessionStorage.setItem('user', JSON.stringify(res.data))
            userInfo.value = res.data
        }
    } catch { }
}

onMounted(async () => {
    try {
        userInfo.value = JSON.parse(sessionStorage.getItem('user'))
        if (!userInfo.value) router.push('/login')
        else {
            loadingPosts.value = true
            const token = sessionStorage.getItem('token')
            // Llamada a la API personalizada para obtener los posts del usuario
            const res = await axios.get('viewPostOfUser', token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined)
            if (Array.isArray(res.data)) {
                userPosts.value = res.data
                if (userPosts.value.length === 0) noPostsMsg.value = 'No hay posts.'
            } else {
                userPosts.value = []
                noPostsMsg.value = 'No hay posts.'
            }
        }
    } catch {
        userInfo.value = null
        router.push('/login')
    } finally {
        loadingPosts.value = false
    }
    fetchUserLikes()
    fetchUserSaveds()
    fetchUserFriends()

    // Si el usuario ha sido editado, fuerza recarga de datos desde la API
    if (sessionStorage.getItem('userEdited') === 'true') {
        try {
            const token = sessionStorage.getItem('token')
            const res = await axios.get('viewUser', { headers: { 'Authorization': `Bearer ${token}` } })
            if (res.data) {
                sessionStorage.setItem('user', JSON.stringify(res.data))
                userInfo.value = res.data
            }
        } catch { }
        sessionStorage.removeItem('userEdited')
    }
})
</script>

<template>
    <div class="container" v-if="userInfo">
        <div class="row justify-content-center">
            <div class="col-12 col-md-10 col-lg-8">
                <!-- New Profile Header Structure -->
                <div class="profile-header d-flex mb-3">
                    <!-- Profile Picture Section -->
                    <div class="profile-avatar me-3">
                        <img :src="userAvatar" alt="avatar" class="rounded-circle"
                            style="width: 150px; height: 150px; object-fit: cover;" />
                    </div>
                    <!-- User Info Section -->
                    <div class="profile-info">
                        <div class="d-flex align-items-center mb-2">
                            <h2 class="fw-bold fs-3 mb-0 me-2">{{ userInfo.usuario }}</h2>
                            <span v-if="userInfo.verificado" class="badge bg-success me-1">✔ Verificado</span>
                            <span v-if="userInfo.is_admin" class="badge bg-warning text-dark">Administrador</span>
                            <!-- Botón de editar perfil a la derecha de los badges -->
                            <button @click="router.push('/EditProfile')" class="btn edit-profile-btn"
                                title="Editar perfil">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                        <div class="d-flex gap-4 mb-2 profile-stats align-items-center" style="position: relative;">
                            <div><span class="stat-value">{{ userPosts.length }}</span> <span
                                    class="stat-label">Posts</span></div>
                            <div><span class="stat-value">{{ loadingFriends ? '...' : userFriends.length }}</span> <span
                                    class="stat-label">Amigos</span></div>
                        </div>
                        <div v-if="userInfo.bio" class="bio mb-2 small">{{ userInfo.bio }}</div>
                    </div>
                </div>
                <!-- End New Profile Header Structure -->
                <ul class="nav nav-tabs justify-content-center mb-4" id="profileTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="posts-tab" data-bs-toggle="tab" data-bs-target="#posts"
                            type="button" role="tab" aria-controls="posts" aria-selected="true">Posts</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="likes-tab" data-bs-toggle="tab" data-bs-target="#likes"
                            type="button" role="tab" aria-controls="likes" aria-selected="false">Likes</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="saveds-tab" data-bs-toggle="tab" data-bs-target="#saveds"
                            type="button" role="tab" aria-controls="saveds" aria-selected="false">Saveds</button>
                    </li>
                </ul>
                <div class="tab-content" id="profileTabContent"
                    style="height: 52vh; overflow-y: auto; background: #232323; color: #fff;">
                    <div class="tab-pane fade show active" id="posts" role="tabpanel" aria-labelledby="posts-tab">
                        <div v-if="!loadingPosts && userPosts.length === 0" class="no-posts-message">{{ noPostsMsg }}
                        </div>
                        <div v-if="loadingPosts" class="mt-5 text-center" style="color: #fff;">Cargando...</div>
                        <div class="posts-grid" v-else>
                            <template v-if="userPosts.length > 0">
                                <div v-for="post in userPosts" :key="post.id" class="post-item"
                                    style="background: #181818; color: #fff; border: 1.5px solid #060606; flex-direction: column; cursor: pointer; padding: 0;">
                                    <a :href="`/posts/${post.id}`"
                                        style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; text-decoration: none; color: inherit; padding: 18px 10px 18px 10px; justify-content: flex-start;">
                                        <div style="width: 100%;">
                                            <div
                                                style="font-weight: bold; font-size: 1.45em; margin-bottom: 0.15em; text-align: center;">
                                                {{ post.titulo }}</div>
                                            <div
                                                style="font-size: 1.12em; color: #ffd91c; margin-bottom: 0.7em; text-align: center;">
                                                {{ post.descripcion }}</div>
                                        </div>
                                        <div style="flex: 1 1 auto;"></div>
                                        <img v-if="post.imagen" :src="'http://localhost:8080/' + post.imagen"
                                            alt="Imagen"
                                            style="max-width: 95%; max-height: 180px; border-radius: 10px; margin-top: auto; margin-bottom: 1.1em; object-fit: contain; display: block;" />
                                    </a>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="likes" role="tabpanel" aria-labelledby="likes-tab">
                        <div v-if="!loadingLikes && userLikes.length === 0" class="no-posts-message">{{ noLikesMsg }}
                        </div>
                        <div v-if="loadingLikes" class="mt-5 text-center" style="color: #fff;">Cargando...</div>
                        <div class="posts-grid" v-else>
                            <template v-if="userLikes.length > 0">
                                <div v-for="like in userLikes" :key="like.id" class="post-item"
                                    style="background: #181818; color: #fff; border: 1.5px solid #ffd91c; flex-direction: column; cursor: pointer; padding: 0;">
                                    <a :href="`/posts/${like.id}`"
                                        style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; text-decoration: none; color: inherit; padding: 18px 10px 18px 10px; justify-content: flex-start;">
                                        <div style="width: 100%;">
                                            <div
                                                style="font-weight: bold; font-size: 1.45em; margin-bottom: 0.15em; text-align: center;">
                                                {{ like.titulo }}</div>
                                            <div
                                                style="font-size: 1.12em; color: #ffd91c; margin-bottom: 0.7em; text-align: center;">
                                                {{ like.descripcion }}</div>
                                        </div>
                                        <div style="flex: 1 1 auto;"></div>
                                        <img v-if="like.imagen" :src="'http://localhost:8080/' + like.imagen"
                                            alt="Imagen"
                                            style="max-width: 95%; max-height: 180px; border-radius: 10px; margin-top: auto; margin-bottom: 1.1em; object-fit: contain; display: block;" />
                                    </a>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="saveds" role="tabpanel" aria-labelledby="saveds-tab">
                        <div v-if="!loadingSaveds && userSaveds.length === 0" class="no-posts-message">{{ noSavedsMsg }}
                        </div>
                        <div v-if="loadingSaveds" class="mt-5 text-center" style="color: #fff;">Cargando...</div>
                        <div class="posts-grid" v-else>
                            <template v-if="userSaveds.length > 0">
                                <div v-for="saved in userSaveds" :key="saved.id" class="post-item"
                                    style="background: #181818; color: #fff; border: 1.5px solid #ffd91c; flex-direction: column; cursor: pointer; padding: 0;">
                                    <a :href="`/posts/${saved.id}`"
                                        style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; text-decoration: none; color: inherit; padding: 18px 10px 18px 10px; justify-content: flex-start;">
                                        <div style="width: 100%;">
                                            <div
                                                style="font-weight: bold; font-size: 1.45em; margin-bottom: 0.15em; text-align: center;">
                                                {{ saved.titulo }}</div>
                                            <div
                                                style="font-size: 1.12em; color: #ffd91c; margin-bottom: 0.7em; text-align: center;">
                                                {{ saved.descripcion }}</div>
                                        </div>
                                        <div style="flex: 1 1 auto;"></div>
                                        <img v-if="saved.imagen" :src="'http://localhost:8080/' + saved.imagen"
                                            alt="Imagen"
                                            style="max-width: 95%; max-height: 180px; border-radius: 10px; margin-top: auto; margin-bottom: 1.1em; object-fit: contain; display: block;" />
                                    </a>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    margin-top: 60px;
}

.profile-header {
    border-radius: 18px;
    padding: 20px;
    align-items: center;
}

.profile-avatar img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid #8E44FF;
}

.profile-info h2 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 10px;
}

.edit-profile-btn {
    background: #8E44FF;
    color: #fff;
    border: none;
    border-radius: 6px;
    margin-left: 10px;
    font-size: 1.1em;
    transition: background 0.2s, color 0.2s;
}

.edit-profile-btn:hover {
    color: #121212;
}

.profile-stats .stat-value {
    font-weight: 600;
    color: #8E44FF;
}


.nav-link {
    border-bottom: none;
    font-weight: 600;
    
}

.nav-link.active {
    
    color: #8E44FF;
    border-bottom: 2px solid #8E44FF;
}

.tab-content {

    border-radius: 12px;
    
}

.posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
    margin-top: 1.5em;
}

.post-item {

    border-radius: 10px;
    padding: 0;
    transition: box-shadow 0.2s;
}

.post-item:hover {
    box-shadow: 0 2px 12px #0002;
    border-color: #8E44FF;
}

.post-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: inherit;
    padding: 18px 10px 18px 10px;
    justify-content: flex-start;
}

.post-title {
    font-weight: bold;
    font-size: 1.45em;
    margin-bottom: 0.15em;
    text-align: center;

}

.post-desc {
    font-size: 1.12em;
    color: #8E44FF;
    margin-bottom: 0.7em;
    text-align: center;
}

.post-img {
    max-width: 95%;
    max-height: 180px;
    border-radius: 10px;
    margin-top: auto;
    margin-bottom: 1.1em;
    object-fit: contain;
    display: block;
}

.no-posts-message {

    text-align: center;
    margin-top: 2em;
}


.badge.bg-success {
    background: #8E44FF;
    color: #fff;
}

.badge.bg-warning {
    background: #8E44FF;
    color: #fff;
}

</style>

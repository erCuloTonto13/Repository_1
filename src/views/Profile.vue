<script setup>
import { ref, computed, onMounted } from 'vue'
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

const userAvatar = computed(() => {
    if (userInfo.value && userInfo.value.foto) {
        if (userInfo.value.foto.startsWith('http')) return userInfo.value.foto
        if (userInfo.value.foto.startsWith('storage/')) return 'http://localhost:8080/' + userInfo.value.foto
        return '/' + userInfo.value.foto.replace(/^public\//, '')
    }
    return '/icons/favicon.svg'
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
                        </div>
                        <div class="d-flex gap-4 mb-2 profile-stats">
                            <div><span class="stat-value">0</span> <span class="stat-label">Posts</span></div>
                            <div><span class="stat-value">0</span> <span class="stat-label">Followers</span></div>
                            <div><span class="stat-value">0</span> <span class="stat-label">Following</span></div>
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
                    style="height: 45vh; overflow-y: auto; background: #232323; color: #fff;">
                    <div class="tab-pane fade show active" id="posts" role="tabpanel" aria-labelledby="posts-tab">
                        <div v-if="!loadingPosts && userPosts.length === 0" class="no-posts-message">{{ noPostsMsg }}
                        </div>
                        <div v-if="loadingPosts" class="mt-5 text-center" style="color: #fff;">Cargando...</div>
                        <div class="posts-grid" v-else>
                            <template v-if="userPosts.length > 0">
                                <div v-for="post in userPosts" :key="post.id" class="post-item"
                                    style="background: #181818; color: #fff; border: 1.5px solid #ffd91c; flex-direction: column; cursor: pointer; padding: 0;">
                                    <a :href="`/posts/${post.id}`"
                                        style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; text-decoration: none; color: inherit; padding: 12px 6px;">
                                        <div style="font-weight: bold; margin-bottom: 0.2em;">{{ post.titulo }}</div>
                                        <div style="font-size: 0.95em; color: #bfa600; margin-bottom: 0.2em;">{{
                                            post.descripcion }}</div>
                                        <img v-if="post.imagen" :src="'http://localhost:8080/' + post.imagen"
                                            alt="Imagen"
                                            style="max-width: 90%; max-height: 60px; border-radius: 6px; margin-top: 0.2em;" />
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
                                        style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; text-decoration: none; color: inherit; padding: 12px 6px;">
                                        <div style="font-weight: bold; margin-bottom: 0.2em;">{{ like.titulo }}</div>
                                        <div style="font-size: 0.95em; color: #bfa600; margin-bottom: 0.2em;">{{
                                            like.descripcion }}</div>
                                        <img v-if="like.imagen" :src="'http://localhost:8080/' + like.imagen"
                                            alt="Imagen"
                                            style="max-width: 90%; max-height: 60px; border-radius: 6px; margin-top: 0.2em;" />
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
                                        style="display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%; text-decoration: none; color: inherit; padding: 12px 6px;">
                                        <div style="font-weight: bold; margin-bottom: 0.2em;">{{ saved.titulo }}</div>
                                        <div style="font-size: 0.95em; color: #bfa600; margin-bottom: 0.2em;">{{
                                            saved.descripcion }}</div>
                                        <img v-if="saved.imagen" :src="'http://localhost:8080/' + saved.imagen"
                                            alt="Imagen"
                                            style="max-width: 90%; max-height: 60px; border-radius: 6px; margin-top: 0.2em;" />
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
.profile-header,
.tab-content {
    /* Apply consistent font stack and background */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #232323 !important;
    color: #fff !important;
}

.profile-header {
    padding: 20px;
    border-bottom: 1px solid #dbdbdb;
    align-items: center;
    /* font-family and background-color moved to shared rule */
}

.profile-avatar img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
}

.profile-info {
    color: #fff;
}

.profile-info h2 {
    font-size: 28px;
    font-weight: 300;
    /* Lighter weight for username, Instagram style */
    margin-bottom: 10px;
}

.profile-info .d-flex.align-items-center .badge {
    /* Targeting badges next to username */
    font-size: 0.75rem;
    padding: 0.4em 0.6em;
}

.profile-info .d-flex.gap-4 {
    /* This is the stats row */
    margin-bottom: 10px;
    font-size: 16px;
    /* Base size for stat items */
}

.profile-stats div {
    /* Each stat item */
    margin-right: 30px;
    /* Increased spacing between stat items */
    text-align: left;
}

.profile-stats .stat-value {
    font-weight: 600;
    color: #fff;
    display: block;
    /* Make number appear on top */
    font-size: 1.1em;
    /* Slightly larger for emphasis */
}

.profile-stats .stat-label {
    color: #8e8e8e;
    /* Lighter color for the label */
    font-size: 0.9em;
}

.profile-info .bio {
    font-size: 16px;
    line-height: 1.4;
    color: #fff;
    /* Ensure bio text is also dark grey */
}

/* Override some bootstrap defaults if needed or adjust existing ones */
/* .container {
    Example: If container adds unwanted padding for this specific view
    padding-left: 0;
    padding-right: 0;
} */

/* Styling for Tab Navigation and Content */
.nav-tabs {
    border-bottom: 1px solid #dbdbdb;
    /* Light border for the bottom of the tab bar */
}

.nav-tabs .nav-item {
    margin-bottom: -1px;
    /* Align active tab's border with the .nav-tabs border */
}

.nav-tabs .nav-link {
    color: #8e8e8e;
    /* Medium grey for inactive tabs */
    background-color: transparent;
    border: none;
    /* Remove default Bootstrap borders */
    border-top: 1px solid transparent;
    /* Placeholder for active state */
    padding: 1rem 1rem;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.nav-tabs .nav-link:hover {
    color: #ffd91c;
    /* Darker color on hover for inactive tabs */
}

.nav-tabs .nav-link.active {
    color: #ffd91c;
    /* Dark grey for active tab */
    background-color: transparent;
    border-top: 1px solid #ffd91c;
    /* Top border for active tab indicator */
    border-bottom-color: transparent;
    /* Ensure no bottom border from Bootstrap overrides */
}

.tab-content {
    /* background-color and color inherited from .tab-content's new shared rule */
    padding: 20px;
    /* Restore padding removed from Bootstrap classes */
    /* height: 45vh; overflow-y: auto; are inline styles, kept them */
}

.tab-placeholder-content {
    text-align: center;
    color: #8e8e8e;
}

.posts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* 3 columns */
    gap: 4px;
    /* Small gap between items, Instagram-like */
}

.post-item {
    aspect-ratio: 1 / 1;
    /* Square items */
    background-color: #e0e0e0;
    /* Light grey background for items */
    border: 1px solid #dbdbdb;
    /* Slightly darker border */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    /* Text color if any, though not explicitly requested for dummy items */
    font-size: 12px;
    /* For any text like "Post Item" if added */
}

.loading-spinner {
    grid-column: span 3;
    /* Ocupa las 3 columnas */
    text-align: center;
    padding: 20px 0;
    font-size: 16px;
    color: #fff;
}

.no-posts-message {
    grid-column: span 3;
    /* Ocupa las 3 columnas */
    text-align: center;
    padding: 20px 0 10px 0;
    font-size: 16px;
    color: #fff;
}
</style>

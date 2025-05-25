<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userInfo = ref(null)

onMounted(() => {
    try {
        userInfo.value = JSON.parse(sessionStorage.getItem('user'))
        if (!userInfo.value) router.push('/login')
    } catch {
        userInfo.value = null
        router.push('/login')
    }
})

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
                        <img :src="userAvatar" alt="avatar" class="rounded-circle" style="width: 150px; height: 150px; object-fit: cover;" />
                    </div>
                    <!-- User Info Section -->
                    <div class="profile-info">
                        <div class="d-flex align-items-center mb-2">
                            <h2 class="fw-bold fs-3 mb-0 me-2">{{ userInfo.usuario }}</h2>
                            <span v-if="userInfo.verificado" class="badge badge-verified me-1">✔ Verificado</span>
                            <span v-if="userInfo.is_admin" class="badge badge-admin">Administrador</span>
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
                <div class="tab-content" id="profileTabContent" style="height: 45vh; overflow-y: auto;">
                    <div class="tab-pane fade show active" id="posts" role="tabpanel" aria-labelledby="posts-tab">
                        <div class="posts-grid">
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                            <div class="post-item"></div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="likes" role="tabpanel" aria-labelledby="likes-tab">
                        <div class="tab-placeholder-content">Likes.</div>
                    </div>
                    <div class="tab-pane fade" id="saveds" role="tabpanel" aria-labelledby="saveds-tab">
                        <div class="tab-placeholder-content">Guardados.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-header, .tab-content { /* Apply consistent font stack and background */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--color-card-background); /* "Fondo secundario" for profile sections */
    color: var(--color-text); /* Default text color */
}

.profile-header {
    padding: 20px;
    border-bottom: 1px solid var(--color-border); /* General border color */
    align-items: center;
}

.profile-avatar img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 50%;
    border: 1px solid var(--color-border); /* General border color */
}

.profile-info {
    color: var(--color-text); /* Default text color */
}

.profile-info h2 { /* Username */
    font-size: 28px;
    font-weight: 300;
    margin-bottom: 10px;
    color: var(--color-text); /* Or --color-primary if it needs to stand out */
}

.badge { /* Generic badge styling */
    font-size: 0.75rem;
    padding: 0.4em 0.6em;
    color: var(--color-background); /* Text color that contrasts with badge background */
}

.badge-verified {
    background-color: var(--color-primary); /* Using primary for "Verificado" */
}

.badge-admin {
    background-color: var(--color-secondary); /* Using secondary for "Administrador" */
}

.profile-info .d-flex.gap-4 { /* This is the stats row */
    margin-bottom: 10px;
    font-size: 16px; /* Base size for stat items */
}

.profile-stats div { /* Each stat item */
    margin-right: 30px; /* Increased spacing between stat items */
    text-align: left;
}

.profile-stats .stat-value {
    font-weight: 600;
    color: var(--color-text); /* Default text color */
    display: block; 
    font-size: 1.1em; 
}

.profile-stats .stat-label {
    color: var(--color-text-secondary); /* Secondary text color */
    font-size: 0.9em;
}

.profile-info .bio {
    font-size: 16px;
    line-height: 1.4;
    color: var(--color-text-secondary); /* Secondary text color for bio */
}

/* Override some bootstrap defaults if needed or adjust existing ones */
.container {
    /* Example: If container adds unwanted padding for this specific view */
    /* padding-left: 0; */
    /* padding-right: 0; */
}

/* Styling for Tab Navigation and Content */
.nav-tabs {
    border-bottom: 1px solid var(--color-border); /* General border color */
}

.nav-tabs .nav-item {
    margin-bottom: -1px; 
}

.nav-tabs .nav-link {
    color: var(--color-text-secondary); /* Secondary text for inactive tabs */
    background-color: transparent;
    border: none; 
    border-top: 1px solid transparent; 
    padding: 1rem 1rem;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.nav-tabs .nav-link:hover {
    color: var(--color-text); /* Default text color on hover */
}

.nav-tabs .nav-link.active {
    color: var(--color-primary); /* Primary color for active tab text */
    background-color: transparent;
    border-top: 1px solid var(--color-primary); /* Primary color for active tab border */
    border-bottom-color: transparent; 
}

.tab-content {
    /* background-color, color, font-family inherited */
    padding: 20px; 
}

.tab-placeholder-content {
    text-align: center;
    color: var(--color-text-secondary); /* Secondary text color */
    padding: 40px 0; 
    font-size: 16px;
}

/* Styling for Posts Grid */
.posts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 columns */
    gap: 4px; /* Small gap between items, Instagram-like */
}

.post-item {
    aspect-ratio: 1 / 1; 
    background-color: var(--color-background); /* Main background for post items, or --color-card-background for consistency */
    border: 1px solid var(--color-border); /* General border color */
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary); /* Secondary text color */
    font-size: 12px; 
}

</style>

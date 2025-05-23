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
    background-color: #fafafa;
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
    color: #262626; /* Dark grey for primary text */
}

.profile-info h2 {
    font-size: 28px;
    font-weight: 300; /* Lighter weight for username, Instagram style */
    margin-bottom: 10px;
}

.profile-info .d-flex.align-items-center .badge { /* Targeting badges next to username */
    font-size: 0.75rem;
    padding: 0.4em 0.6em;
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
    color: #262626;
    display: block; /* Make number appear on top */
    font-size: 1.1em; /* Slightly larger for emphasis */
}

.profile-stats .stat-label {
    color: #8e8e8e; /* Lighter color for the label */
    font-size: 0.9em;
}

.profile-info .bio {
    font-size: 16px;
    line-height: 1.4;
    color: #262626; /* Ensure bio text is also dark grey */
}

/* Override some bootstrap defaults if needed or adjust existing ones */
.container {
    /* Example: If container adds unwanted padding for this specific view */
    /* padding-left: 0; */
    /* padding-right: 0; */
}

/* Styling for Tab Navigation and Content */
.nav-tabs {
    border-bottom: 1px solid #dbdbdb; /* Light border for the bottom of the tab bar */
}

.nav-tabs .nav-item {
    margin-bottom: -1px; /* Align active tab's border with the .nav-tabs border */
}

.nav-tabs .nav-link {
    color: #8e8e8e; /* Medium grey for inactive tabs */
    background-color: transparent;
    border: none; /* Remove default Bootstrap borders */
    border-top: 1px solid transparent; /* Placeholder for active state */
    padding: 1rem 1rem;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.nav-tabs .nav-link:hover {
    color: #262626; /* Darker color on hover for inactive tabs */
}

.nav-tabs .nav-link.active {
    color: #262626; /* Dark grey for active tab */
    background-color: transparent;
    border-top: 1px solid #262626; /* Top border for active tab indicator */
    border-bottom-color: transparent; /* Ensure no bottom border from Bootstrap overrides */
}

.tab-content {
    /* background-color and color inherited from .tab-content's new shared rule */
    padding: 20px; /* Restore padding removed from Bootstrap classes */
    /* height: 45vh; overflow-y: auto; are inline styles, kept them */
}

.tab-placeholder-content {
    text-align: center;
    color: #8e8e8e; /* Medium grey for placeholder text */
    padding: 40px 0; /* Give some spacing */
    font-size: 16px;
}

/* Styling for Posts Grid */
.posts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 columns */
    gap: 4px; /* Small gap between items, Instagram-like */
}

.post-item {
    aspect-ratio: 1 / 1; /* Square items */
    background-color: #e0e0e0; /* Light grey background for items */
    border: 1px solid #dbdbdb; /* Slightly darker border */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8e8e8e; /* Text color if any, though not explicitly requested for dummy items */
    font-size: 12px; /* For any text like "Post Item" if added */
}

</style>

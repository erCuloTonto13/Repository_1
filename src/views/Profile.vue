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
                <div class="card bg-opacity-75 text-warning shadow-lg border-0 mb-3"
                    style="min-height: 37vh; margin-top:2.5vh;background-color: gray;">
                    <div class="card-body d-flex flex-column align-items-center p-3">
                        <div class="rounded-circle bg-secondary bg-opacity-25 mb-2 d-flex align-items-center justify-content-center"
                            style="width: 90px; height: 90px; overflow: hidden;">
                            <img :src="userAvatar" alt="avatar" width="90" height="90" />
                        </div>
                        <h2 class="fw-bold mb-1 fs-3">{{ userInfo.usuario }}</h2>
                        <div class="d-flex justify-content-center gap-3 mb-1">
                            <span v-if="userInfo.verificado" class="badge bg-success">✔ Verificado</span>
                            <span v-if="userInfo.is_admin" class="badge bg-warning text-dark">Administrador</span>
                        </div>
                        <div class="text-light mb-1 small">{{ userInfo.email }}</div>
                        <div v-if="userInfo.bio" class="text-warning text-center mb-2 small">{{ userInfo.bio }}</div>
                    </div>
                </div>
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
                <div class="tab-content bg-primary bg-opacity-75 rounded-4 shadow-sm p-4 text-warning"
                    id="profileTabContent" style="height: 45vh; overflow-y: auto;">
                    <div class="tab-pane fade show active" id="posts" role="tabpanel" aria-labelledby="posts-tab">
                        <div class="text-center text-light opacity-75 py-4">Posts.</div>
                    </div>
                    <div class="tab-pane fade" id="likes" role="tabpanel" aria-labelledby="likes-tab">
                        <div class="text-center text-light opacity-75 py-4">Likes.</div>
                    </div>
                    <div class="tab-pane fade" id="saveds" role="tabpanel" aria-labelledby="saveds-tab">
                        <div class="text-center text-light opacity-75 py-4">Guardados.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>

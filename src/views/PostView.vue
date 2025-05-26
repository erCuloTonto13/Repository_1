<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'


axios.defaults.baseURL = 'http://localhost:8080/api/'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const loading = ref(true)
const error = ref(null)
const comments = ref([])
const commentsLoading = ref(true)
const commentsError = ref(null)

onMounted(async () => {
    const id = route.params.id
    try {
        const res = await axios.get(`/posts/${id}`)
        post.value = res.data
    } catch (e) {
        error.value = 'No se pudo cargar el post.'
    } finally {
        loading.value = false
    }

    await fetchComments()
})

async function fetchComments() {
    commentsLoading.value = true
    commentsError.value = null
    try {
        const res = await axios.get(`/posts/${route.params.id}/comments`)
        comments.value = Array.isArray(res.data) ? res.data : []
    } catch (e) {
        commentsError.value = 'No se pudieron cargar los comentarios.'
    } finally {
        commentsLoading.value = false
    }
}

function formatDateDMY(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d)) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}
</script>

<template>
    <div class="post-reddit-container">
        <div v-if="loading" class="loading">Cargando post...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="post">
            <div class="reddit-post-card">
                <div v-if="post.titulo" class="reddit-title">{{ post.titulo }}</div>
                <div v-if="post.descripcion" class="reddit-desc">{{ post.descripcion }}</div>
                <div v-if="post.imagen" class="reddit-img-wrapper">
                    <img :src="post.imagen.startsWith('http') ? post.imagen : 'http://localhost:8080/' + post.imagen"
                        :alt="post.titulo || 'Imagen del post'" class="reddit-img" />
                </div>
                <div class="reddit-meta" v-if="post.created_at">
                    <span class="post-date">
                        Publicado el {{ formatDateDMY(post.created_at) }}
                    </span>
                </div>
            </div>
            <div class="comments-section">
                <h3 class="comments-title">Comentarios</h3>
                <div v-if="commentsLoading" class="loading">Cargando comentarios...</div>
                <div v-else-if="commentsError" class="error">{{ commentsError }}</div>
                <div v-else>
                    <div v-if="comments.length === 0" class="no-comments">No hay comentarios aún.</div>
                    <div v-for="comment in comments" :key="comment.id" class="comment-card">
                        <div class="comment-user">{{ comment.usuario || 'Anónimo' }}</div>
                        <div class="comment-body">{{ comment.texto }}</div>
                        <div class="comment-date">{{ formatDateDMY(comment.created_at) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.post-reddit-container {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    background: transparent;
    width: 100vw;
    max-width: 100vw;
    margin: 0;
    padding-top: 0;
}

.reddit-post-card {
    background: #181818ee;
    border-radius: 18px;
    box-shadow: 0 4px 24px #8E44FF22, 0 2px 12px #00fff733;
    border: 2.5px solid #8E44FF;
    width: 98vw;
    max-width: 1400px;
    margin: 0 auto 2em auto;
    padding: 3em 3em 2em 3em;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.reddit-title {
    color: #fff;
    font-size: 2em;
    font-weight: 700;
    margin-bottom: 0.4em;
    letter-spacing: 0.01em;
    text-align: left;
    width: 100%;
}

.reddit-desc {
    color: #8E44FF;
    font-size: 1.15em;
    margin-bottom: 1.2em;
    font-weight: 500;
    text-align: left;
    width: 100%;
}

.reddit-img-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 1.5em;
}

.reddit-img {
    max-width: 98vw;
    max-height: 520px;
    border-radius: 14px;
    box-shadow: 0 2px 12px #0008;
    background: #232323;
    object-fit: contain;
}

.reddit-meta {
    font-size: 1em;
    margin-top: 0.5em;
    text-align: left;
    width: 100%;
}

.comments-section {
    width: 100%;
    margin-top: 2em;
    background: #181818cc;
    border-radius: 14px;
    box-shadow: 0 2px 12px #8E44FF11;
    padding: 1.2em 1.5em 1.5em 1.5em;
}

.comments-title {
    color: #8E44FF;
    font-size: 1.25em;
    font-weight: 700;
    margin-bottom: 1em;
}

.no-comments {
    color: #aaa;
    text-align: center;
    margin: 1.5em 0;
}

.comment-card {
    background: #232323;
    border-radius: 10px;
    box-shadow: 0 1px 6px #0004;
    margin-bottom: 1.1em;
    padding: 0.9em 1em 0.7em 1em;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 0.2em;
}

.comment-user {
    color: #ffd600;
    font-weight: 600;
    font-size: 1em;
}

.comment-body {
    color: #fff;
    font-size: 1.08em;
    margin: 0.2em 0 0.1em 0;
}

.comment-date {
    color: #8E44FF;
    font-size: 0.95em;
    align-self: flex-end;
}
</style>

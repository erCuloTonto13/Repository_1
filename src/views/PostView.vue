<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useInfiniteScroll } from '@vueuse/core'


axios.defaults.baseURL = 'http://localhost:8080/api/'

const route = useRoute()
const post = ref(null)
const loading = ref(true)
const error = ref(null)
const comments = ref([])
const commentsLoading = ref(true)
const commentsError = ref(null)
const commentUsers = ref({}); // { [userId]: userData }
const commentsPage = ref(1)
const commentsPageSize = 5
const commentsAllLoaded = ref(false)
const commentsContainer = ref(null)

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

    await fetchComments(commentsPage.value)
    useInfiniteScroll(
        commentsContainer,
        async () => {
            if (!commentsLoading.value && !commentsAllLoaded.value) {
                commentsPage.value++
                await fetchComments(commentsPage.value)
            }
        },
        { distance: 200 }
    )
})

async function fetchUser(userId) {
    if (!userId || commentUsers.value[userId]) return;
    try {
        const res = await axios.get(`/users/${userId}`);
        commentUsers.value[userId] = res.data;
    } catch (e) {
        commentUsers.value[userId] = { usuario: 'Anónimo' };
    }
}

async function fetchComments(page = 1) {
    // Elimina el return si page === 1 para permitir recarga inicial
    if (commentsLoading.value && page !== 1) return;
    if (commentsAllLoaded.value && page !== 1) return;
    commentsLoading.value = true;
    commentsError.value = null;
    try {
        const res = await axios.get(`/commentsOfPost/${route.params.id}?page=${page}&limit=${commentsPageSize}`);
        const paginator = res.data.comments;
        const newComments = Array.isArray(paginator.data) ? paginator.data : [];
        if (page === 1) {
            comments.value = newComments;
            commentsAllLoaded.value = false;
        } else {
            comments.value = [...comments.value, ...newComments];
        }
        if (!paginator.next_page_url || newComments.length < commentsPageSize) {
            commentsAllLoaded.value = true;
        }
        for (const comment of newComments) {
            if (comment.usuario_id) {
                await fetchUser(comment.usuario_id);
            }
        }
    } catch (e) {
        commentsError.value = 'No se pudieron cargar los comentarios.';
    } finally {
        commentsLoading.value = false;
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
            <div class="comments-section" ref="commentsContainer">
                <div class="comments-header">
                    <h3 class="comments-title">Comentarios</h3>
                    <button class="create-comment-btn">Crear comentario</button>
                </div>
                <div v-if="commentsLoading && comments.length === 0" class="loading">Cargando comentarios...</div>
                <div v-else-if="commentsError" class="error">{{ commentsError }}</div>
                <div v-else>
                    <div v-if="comments.length === 0" class="no-comments">No hay comentarios aún.</div>
                    <div v-for="comment in comments" :key="comment.id" class="comment-card">
                        <div class="comment-user">
                            {{ commentUsers[comment.usuario_id]?.usuario || comment.usuario || 'Anónimo' }}
                        </div>
                        <div class="comment-body">{{ comment.texto }}</div>
                        <img v-if="comment.imagen && comment.imagen !== ''"
                            :src="comment.imagen.startsWith('http') ? comment.imagen : 'http://localhost:8080/' + comment.imagen"
                            class="comment-img" />
                        <div class="comment-date">{{ formatDateDMY(comment.created_at) }}</div>
                    </div>
                    <div v-if="commentsLoading && comments.length > 0" class="loading">Cargando más...</div>
                    <div v-if="commentsAllLoaded && comments.length > 0" class="end-message">No hay más comentarios.
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

.comments-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1em;
}

.create-comment-btn {
    background: #8E44FF;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.5em 1.4em;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px #8E44FF33;
    transition: background 0.2s;
    margin-right: 1em;
}

.create-comment-btn:hover {
    background: #6c2bd7;
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

.comment-img {
    margin: 0.5em 0 0.5em 0;
    max-width: 320px;
    max-height: 220px;
    border-radius: 8px;
    box-shadow: 0 1px 6px #8E44FF44;
    align-self: flex-start;
    background: #181818;
    object-fit: contain;
}

.comment-date {
    color: #8E44FF;
    font-size: 0.95em;
    align-self: flex-end;
}

.comment-img-wrapper {
    margin: 0.5em 0 0.7em 0;
    display: flex;
    justify-content: flex-start;
}

.comment-img {
    max-width: 220px;
    max-height: 180px;
    border-radius: 8px;
    box-shadow: 0 1px 6px #8E44FF44;
    background: #232323;
    object-fit: cover;
}

.more-comments-loading,
.no-more-comments {
    text-align: center;
    color: #aaa;
    margin: 1.5em 0;
    font-size: 1em;
}
</style>

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

const showCommentForm = ref(false)
const newCommentText = ref('')
const newCommentImage = ref(null)
const newCommentImageUrl = ref('')
const newCommentLoading = ref(false)
const newCommentError = ref('')

const isLogged = ref(!!sessionStorage.getItem('token'))

window.addEventListener('storage', () => {
    isLogged.value = !!sessionStorage.getItem('token')
})
window.addEventListener('token-changed', () => {
    isLogged.value = !!sessionStorage.getItem('token')
})

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

function openCommentForm() {
    showCommentForm.value = true
    newCommentText.value = ''
    newCommentImage.value = null
    newCommentImageUrl.value = ''
    newCommentError.value = ''
}
function closeCommentForm() {
    showCommentForm.value = false
    newCommentText.value = ''
    newCommentImage.value = null
    newCommentImageUrl.value = ''
    newCommentError.value = ''
}
function handleFileChange(e) {
    const file = e.target.files[0]
    newCommentImage.value = file
    if (file) {
        newCommentImageUrl.value = URL.createObjectURL(file)
    } else {
        newCommentImageUrl.value = ''
    }
}

async function submitComment() {
    newCommentError.value = ''
    if (!newCommentText.value.trim()) {
        newCommentError.value = 'La descripción es obligatoria.'
        return
    }
    newCommentLoading.value = true
    try {
        const formData = new FormData()
        formData.append('texto', newCommentText.value)
        if (newCommentImage.value) {
            formData.append('imagen', newCommentImage.value)
        }
        formData.append('post_id', post.value.id)
        // Si tienes auth, añade el token
        const token = sessionStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        await axios.post('/comments', formData, { headers })
        closeCommentForm()
        window.location.reload()
    } catch (e) {
        newCommentError.value = 'No se pudo crear el comentario.'
    } finally {
        newCommentLoading.value = false
    }
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
                    <button v-if="isLogged" class="create-comment-btn" @click="openCommentForm">Crear comentario</button>
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
                <!-- Modal Bootstrap custom -->
                <div v-if="showCommentForm && isLogged" class="modal fade show comment-form-modal" tabindex="-1" style="display: flex; background: #000a;" aria-modal="true" role="dialog" @mousedown.self="closeCommentForm">
                  <div class="modal-dialog modal-dialog-centered" style="max-width: 420px; min-width: 320px;">
                    <div class="modal-content comment-form" style="background: #232323; border-radius: 12px; box-shadow: 0 2px 16px #8E44FF55;">
                      <div class="modal-body" style="padding: 1.5em 1.5em 1em 1.5em;">
                        <textarea v-model="newCommentText" class="comment-input" placeholder="Escribe tu comentario..." rows="3" maxlength="500"></textarea>
                        <div class="comment-form-actions">
                          <label class="file-label">
                            <input type="file" accept="image/*" @change="handleFileChange" style="display:none;" />
                            <span class="file-btn">📎 Imagen</span>
                          </label>
                          <span v-if="newCommentImageUrl" class="preview-img">
                            <img :src="newCommentImageUrl" alt="preview" />
                          </span>
                          <button class="cancel-btn" type="button" @click="closeCommentForm">Cancelar</button>
                          <button class="send-btn" :disabled="newCommentLoading" @click="submitComment">
                            {{ newCommentLoading ? 'Enviando...' : 'Enviar' }}
                          </button>
                        </div>
                        <div v-if="newCommentError" class="comment-error">{{ newCommentError }}</div>
                      </div>
                    </div>
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

.comment-form {
    background: #232323;
    border-radius: 12px;
    box-shadow: 0 2px 16px #8E44FF55;
    padding: 1.5em 1.5em 1em 1.5em;
    min-width: 320px;
    max-width: 95vw;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.7em;
}

.comment-form-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000a;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
}

.form-title {
    color: #8E44FF;
    font-size: 1.5em;
    font-weight: 700;
    margin-bottom: 1em;
}

.comment-input {
    width: 100%;
    min-width: 220px;
    max-width: 420px;
    min-height: 60px;
    max-height: 120px;
    border-radius: 8px;
    border: 1.5px solid #8E44FF;
    background: #181818;
    color: #fff;
    font-size: 1.08em;
    padding: 0.7em 1em;
    resize: vertical;
    margin-bottom: 0.5em;
}

.comment-form-actions {
    display: flex;
    align-items: center;
    gap: 0.7em;
    width: 100%;
}

.file-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.file-btn {
    background: #fff205;
    color: #232323;
    border-radius: 6px;
    padding: 0.2em 0.7em;
    font-size: 0.98em;
    font-weight: 600;
    margin-right: 0.5em;
    cursor: pointer;
    border: none;
    transition: background 0.18s;
}

.file-btn:hover {
    background: #ffe066;
}

.preview-img img {
    max-width: 48px;
    max-height: 48px;
    border-radius: 6px;
    margin-left: 0.3em;
    box-shadow: 0 1px 6px #8E44FF44;
}

.send-btn {
    background: #8E44FF;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.3em 1.1em;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px #8E44FF33;
    transition: background 0.2s;
}

.send-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.send-btn:hover {
    background: #6c2bd7;
}

.cancel-btn {
    background: #232323;
    color: #fff;
    border: 1.5px solid #8E44FF;
    border-radius: 8px;
    padding: 0.3em 1.1em;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    margin-left: 0.5em;
    transition: background 0.2s, color 0.2s;
}

.cancel-btn:hover {
    background: #8E44FF;
    color: #fff205;
}

.comment-error {
    color: #ff4d4f;
    background: #2b1a1a;
    border-radius: 0.5em;
    padding: 0.4em 1em;
    margin-top: 0.5em;
    width: 100%;
    text-align: center;
    font-size: 1rem;
}

.loader {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #8E44FF;
    border-radius: 50%;
    width: 1em;
    height: 1em;
    animation: spin 0.6s linear infinite;
    display: inline-block;
    margin-right: 0.5em;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

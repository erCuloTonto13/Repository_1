<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import commentIcon from '/public/icons/comment.svg'
import likeIcon from '/public/icons/like.svg'
import saveIcon from '/public/icons/save.svg'

axios.defaults.baseURL = 'http://localhost:8080/api/'

const data = ref(null)
const error = ref(null)
const commentsCount = ref({}) 
const likesCount = ref({})

function getImageUrl(path) {
    if (!path) return null
    return 'http://localhost:8080/' + path;
}

// Función para obtener el número de comentarios de un post
async function fetchCommentsCount(postId) {
    try {
        const response = await axios.get(`commentsOfPost/${postId}`)
        
        commentsCount.value[postId] = Array.isArray(response.data.comments) ? response.data.comments.length : 0
    } catch (e) {
        commentsCount.value[postId] = 0
    }
}

// Función para obtener el número de likes de un post
async function fetchLikesCount(postId) {
    try {
        const response = await axios.get(`likesOfPost/${postId}`)
        likesCount.value[postId] = Array.isArray(response.data.likes) ? response.data.likes.length : 0
    } catch (e) {
        likesCount.value[postId] = 0
    }
}

onMounted(async () => {
    try {
        const response = await axios.get('posts')
        data.value = response.data
        // Llamar a la función para cada post
        if (Array.isArray(data.value)) {
            for (const post of data.value) {
                fetchCommentsCount(post.id)
                fetchLikesCount(post.id)
            }
        }
    } catch (err) {
        error.value = err
    }
})
</script>


<template>
    <div class="layout">
        <div v-if="error">Error: {{ error.message }}</div>
        <div v-else-if="data">
            <div class="cards-container">
                <div v-for="(item, id) in data" :key="item.id || id" class="card" :class="{ 'has-image': item.imagen }">
                    <a class="card-link" :href="`/posts/${item.id}`" tabindex="0" target="_self"
                        style="text-decoration: none; color: inherit; display: block;">
                        <div class="card-content">
                            <p class="h5 mb-1">{{ item.titulo }}</p>
                            <p class="h6 mb-0">{{ item.descripcion }}</p> <!-- Removed text-white class -->
                            <img v-if="item.imagen" :src="getImageUrl(item.imagen)" alt="Imagen" class="card-img"
                                @error="event.target.style.display = 'none'" />
                        </div>
                    </a>
                    <div class="iconos">
                        <span class="icon-action" title="Comentar">
                            <a :href="`/posts/${item.id}`">
                                <img :src="commentIcon" alt="comment image" />
                            </a>
                            <span class="icon-count">{{ commentsCount[item.id] ?? '' }}</span>
                        </span>
                        <span class="icon-action" title="Me gusta">
                            <img :src="likeIcon" alt="Like image" />
                            <span class="icon-count">{{ likesCount[item.id] ?? '' }}</span>
                        </span>
                        <span class="icon-action" title="Guardar">
                            <img :src="saveIcon" alt="Save image" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>Cargando...</div>
    </div>
</template>


<style scoped>
.layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: calc(100vh - 9vh); 
    width: 100vw;
    background-color: var(--color-background); /* Use main background */
    overflow: auto;
    padding-top: 3vh;
}

.cards-container {
    display: flex;
    flex-direction: column;
    gap: 2vh;
    width: 100%;
    align-items: center;
}

.card {
    background: var(--color-card-background); /* Updated */
    color: var(--color-text); 
    border: 1px solid var(--color-border); 
    border-radius: 1vw;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
    width: 60vw;
    min-width: 260px;
    max-width: 700px;
    font-size: 1.1rem;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
}

.card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); /* Consider theming shadows later */
    transform: translateY(-0.5vh);
    /* For hover, a subtle change. Could be a new variable --color-card-background-hover */
    /* For now, let's make it slightly brighter or darker based on theme via filter if simple, or use --color-background */
    background: var(--color-background); 
}

.card.has-image {
    height: auto;
}

.card-content {
    padding: 2vh 2vw;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.card-link .h6 { /* Description text */
    color: var(--color-text-secondary) !important; /* Use new secondary text variable */
}

.card-img {
    width: 100%;
    max-height: 30vh;
    object-fit: contain;
    border-radius: 0.7vw;
    margin-bottom: 1vh;
    margin-top: 1vh;
}

.iconos {
    display: flex;
    gap: 2vw;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--color-border); /* Updated */
    padding: 1vh;
    z-index: 4;
}

.icon-action {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: transform 0.1s;
}

.icon-action:hover {
    transform: scale(1.2);
    filter: brightness(1.3); /* This filter might need adjustment based on icon color and theme */
}

.icon-action img { /* Styles for the icons themselves */
    width: 28px;
    height: 28px;
    object-fit: contain;
    display: block;
    /* Consider filter: var(--icon-filter); if icons need to change color with theme */
}

.icon-count {
    font-size: 1rem;
    color: var(--color-text); 
    margin-left: 0.3em;
    vertical-align: middle;
}

/* .comment-count is a duplicate of .icon-count, removing it */
</style>

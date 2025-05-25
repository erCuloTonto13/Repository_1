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
                            <p class="h5 mb-1 card-title">{{ item.titulo }}</p>
                            <p class="h6 text-muted pt-2 mb-3">{{ item.descripcion }}</p>
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

    border: none;
    padding-bottom: 0.5vh;
    border-bottom: 0.3vh solid #ffd600;
    background-color: transparent;
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
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.2);
    transform: translateY(-0.5vh);

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
    background-color: transparent;
    gap: 2vw;
    align-items: center;
    justify-content: center;
    padding: 1vh;
    z-index: 4;
}

.icon-action {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 64px;
    height: 38px;
    padding: 0 18px;
    background: #fff;
    border-radius: 22px/19px;
    box-shadow: 0 2px 8px #0001;
    font-size: 1.5rem;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.18s;
    margin: 0 0.2vw;
    border: 1.5px solid #f4f4f4;
}

.icon-action:hover {
    transform: scale(1.08);
    filter: brightness(1.1);
    box-shadow: 0 4px 16px #8E44FF22;
}

.icon-action img {
    width: 26px;
    height: 26px;
    object-fit: contain;
    display: block;
    margin-right: 0.5em;
    filter: brightness(0) invert(0);
    /*Cambia los iconos blancos en negro */
}

.icon-count {
    font-size: 1.08rem;
    color: #232323;
    font-weight: 600;
    margin-left: 0.1em;
    vertical-align: middle;
}

.comment-count {
    font-size: 1rem;

    margin-left: 0.3em;
    vertical-align: middle;
}

.card-container {
    border-radius: 14px;
    box-shadow: 0 2px 12px #0002;
    padding: 1.5em 1em;
    margin: 1em auto;

}

.card-title {

    font-weight: 600;
    width: 100%;
    text-align: center;
    padding-bottom: 0.7vh;
}


.card-action {
    background: #FF1744;
    color: #fff;
    border-radius: 8px;
    padding: 0.5em 1em;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    border: none;
}

.card-action:hover {
    color: #121212;
}
</style>

<script setup>
import Cards from '../components/Cards.vue'
import FriendsList from '../components/FriendsList.vue';

</script>

<template>
  <div class="center">
    <Cards />
  </div>
  <div id="friends">
    <FriendsList />
    </div>
</template>

<style scoped>
.center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#friends {
  text-align: center;
}
</style>

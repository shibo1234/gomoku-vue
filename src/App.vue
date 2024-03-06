<template>
   <div class="relative-container">
    <video class="background-video" autoplay loop muted playsinline>
          <source src="../src/assets/video/backg.mp4" type="video/mp4">
          Your browser does not support HTML5 video.
      </video>
      <MainPage/>
   </div>
</template>

<script>
import MainPage from './components/MainPage.vue'
export default {
  name: 'App',
  components:{
    MainPage
  }
};
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}
.background-video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    z-index: -1;
}
</style>

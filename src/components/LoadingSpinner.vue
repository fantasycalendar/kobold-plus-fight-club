<script setup>
import { ref } from "vue";

const loadingMessages = ref([
  "Threatening the party",
  "Reading the PHB upside-down",
  "Scrambling CRs",
  "Asking WotC for more source books",
  "Telling the community to be patient",
  "Installing mimics",
  "Sharpening swords",
  "Rendering the cataclysm",
  "Orphaning future adventurers",
  "Burning down villages",
  "Picking a Chosen One",
  "Building golems",
  "Raising princesses",
  "Raising armies",
  "Min/maxing commoners",
  "Lining up the peasant railgun",
  "Writing stats for deities",
  "Training dragons to fly",
  "Min/Maxing house cats",
  "Putting contact lenses on the Beholder eyestalks",
  "Rousing the tarrasque",
  "Shading corners in taverns",
  "Fixing wobbly encounter table",
  "Arming the gazebo",
]);

const loadingMessage =
  loadingMessages.value[
    Math.floor(Math.random() * loadingMessages.value.length)
  ];

const props = defineProps({
  classes: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="grid place-items-center">
    <div class="lds-ripple">
      <div></div>
      <div></div>
    </div>

    <div class="mt-4">{{ loadingMessage }}...</div>
  </div>
</template>

<script>
export default {
  name: "LoadingSpinner",
};
</script>

<style scoped>
.lds-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  @apply border-gray-600 dark:border-emerald-600;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  4.9% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  5% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}
</style>

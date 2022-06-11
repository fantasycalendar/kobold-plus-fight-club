<script setup>
import SourcesModalSource from "./SourcesModalSource.vue";
import { ref } from "vue";

const props = defineProps({
  type: {
    type: Object,
  },
});

const open = ref(true);
</script>

<template>
  <div>
    <div class="mb-4">
      <h4
        class="text-gray-700 dark:text-gray-300 leading-6 mb-2 cursor-pointer"
        @click="open = !open"
      >
        <i
          class="fa mr-1"
          :class="{
            'fa-chevron-right': !open,
            'fa-chevron-down': open,
          }"
        ></i>
        <span v-text="type.title"></span>
      </h4>

      <transition name="slide-fade">
        <div class="grid gap-2 grid-cols-6 md:grid-cols-12 w-full" v-if="open">
          <SourcesModalSource
            v-for="source of type.sources"
            :key="source.name"
            :source="source"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>

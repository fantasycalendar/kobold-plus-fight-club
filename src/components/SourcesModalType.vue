<script setup>
import SourcesModalSource from "./SourcesModalSource.vue";
import { computed, ref } from "vue";

const props = defineProps({
  type: {
    type: Object,
  },
});

const open = ref(true);
const anyEnabled = computed(
  () => !!props.type.sources.filter((source) => source.enabled).length
);

function toggleAll() {
  let targetState = !anyEnabled.value;

  props.type.sources.forEach((source) => (source.enabled = targetState));
}
</script>

<template>
  <div>
    <div class="mb-4">
      <div
        class="text-gray-700 dark:text-gray-300 leading-6 mb-2 flex justify-between items-center"
      >
        <div @click="open = !open" class="cursor-pointer">
          <i
              class="fa mr-1"
              :class="{
            'fa-caret-right': !open,
            'fa-caret-down': open,
          }"
          ></i>
          <span class="text-lg" v-text="type.title"></span>
        </div>

        <div class="primary-link cursor-pointer">
          <span @click="toggleAll" v-text="anyEnabled ? 'Disable all' : 'Enable all'"></span>
        </div>
      </div>

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

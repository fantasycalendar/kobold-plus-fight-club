<script setup>
import { RouterLink, RouterView } from "vue-router";
import HeaderNav from './components/HeaderNav.vue';

import ImporterModal from './components/ImporterModal.vue';
import KeyboardModal from "./components/KeyboardModal.vue";

import NotificationArea from "./components/NotificationArea.vue";
</script>

<script>
export default {
  components: { RouterView, HeaderNav, ImporterModal, KeyboardModal, NotificationArea },
  data() {
    return {
      theme: window.theme,
      showImporterModal: false,
      showKeyboardModal: false,
    }
  },

  methods: {
    showModal(modalData) {
      this['show'+ modalData.name +'Modal'] = true;
    }
  }
}
</script>

<template>
  <div
      class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 flex flex-col"
  >
    <HeaderNav
        @modal="showModal"
    />

    <RouterView />

    <ImporterModal v-model:show="showImporterModal" />
    <KeyboardModal v-model:show="showKeyboardModal" />

    <NotificationArea />
  </div>
</template>

<style>
	/* Nada*/
</style>

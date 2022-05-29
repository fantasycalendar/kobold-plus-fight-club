<script setup>
import { RouterLink, RouterView } from "vue-router";
import HeaderNav from './components/HeaderNav.vue';

import ImporterModal from './components/ImporterModal.vue';
import KeyboardModal from "./components/KeyboardModal.vue";
import SourcesModal from "./components/SourcesModal.vue";

import NotificationArea from "./components/NotificationArea.vue";
</script>

<script>
import hotkeys from "hotkeys-js";

export default {
  components: { RouterView, HeaderNav, ImporterModal, KeyboardModal, NotificationArea },
  data() {
    return {
      theme: window.theme,
      showImporterModal: false,
      showKeyboardModal: false,
      showSourcesModal: true,
      sources: [],
    }
  },

  methods: {
    showModal(modalData) {
      this['show'+ modalData.name +'Modal'] = true;
    },

    setupHotkeys() {
      hotkeys('ctrl+/,ctrl+k,ctrl+shift+\\,ctrl+f,ctrl+[,ctrl+],ctrl+g,ctrl+s,esc', (event, handler) => {
        switch(handler.key) {
          case 'ctrl+/': this.showKeyboardModal =! this.showKeyboardModal;
            return false;
          case 'ctrl+k': document.getElementById('search').focus();
            return false;
          case 'ctrl+shift+\\': this.toggleTheme();
            return false;
          case 'ctrl+f': this.showFilters = (Math.max(
              document.body.scrollWidth,
              document.documentElement.scrollWidth,
              document.body.offsetWidth,
              document.documentElement.offsetWidth,
              document.documentElement.clientWidth
          ) > 1535)
              ? true
              : this.showFilters =! this.showFilters;
            return false;
          case 'ctrl+[': this.setPageNumber(this.currentPage-1);
            return false;
          case 'ctrl+]': this.setPageNumber(this.currentPage+1);
            return false;
          case 'ctrl+s': this.encounter.save();
            return false;
          case 'ctrl+g': this.encounter.generateRandom();
            return false;
          case 'esc':
            this.showPartyModal = false;
            this.showKeyboardModal = false;
            this.showFilters = (Math.max(
                document.body.scrollWidth,
                document.documentElement.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.offsetWidth,
                document.documentElement.clientWidth
            ) > 1535);
            this.showSourcesModal = false;
            break;
        }

        return true;
      })
    },
  },

  created() {
    this.setupHotkeys();

    if(Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    ) > 1535) {
      this.showFilters = true;
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
    <SourcesModal v-model:show="showSourcesModal" />

    <NotificationArea />
  </div>
</template>

<style>
	/* Nada*/
</style>

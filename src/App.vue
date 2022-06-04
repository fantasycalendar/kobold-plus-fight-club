<script setup>
import { RouterView } from "vue-router";
import HeaderNav from "./components/HeaderNav.vue";

import ImporterModal from "./components/ImporterModal.vue";
import KeyboardModal from "./components/KeyboardModal.vue";
import SourcesModal from "./components/SourcesModal.vue";
import PartyModal from "./components/PartyModal.vue";
import EncounterModal from "./components/EncounterModal.vue";

import NotificationArea from "./components/NotificationArea.vue";
import { useMonsters } from "./stores/monsters";
import { useSources } from "./stores/sources";
import { onMounted } from "vue";

const monsters = useMonsters();
const sources = useSources();

onMounted(async () => {
  await sources.fetch();
  await monsters.fetch();
});
</script>

<script>
import hotkeys from "hotkeys-js";

export default {
  data() {
    return {
      theme: window.theme,
      sources: [],
    };
  },

  mounted() {
    this.$watch("theme", (value) =>
      document.documentElement.classList.toggle("dark", value === "dark")
    );
  },

  methods: {
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", this.theme === "dark");
    },

    setupHotkeys() {
      hotkeys("ctrl+shift+\\,esc", (event, handler) => {
        switch (handler.key) {
          case "ctrl+shift+\\":
            this.toggleTheme();
            return false;
          case "esc":
            this.showPartyModal = false;
            this.showKeyboardModal = false;
            this.showFilters =
              Math.max(
                document.body.scrollWidth,
                document.documentElement.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.offsetWidth,
                document.documentElement.clientWidth
              ) > 1535;
            this.showSourcesModal = false;
            break;
        }

        return true;
      });
    },
  },

  created() {
    this.setupHotkeys();

    if (
      Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      ) > 1535
    ) {
      this.showFilters = true;
    }
  },
};
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 flex flex-col"
  >
    <HeaderNav v-model:theme="theme" />

    <RouterView />

    <ImporterModal />
    <KeyboardModal />
    <SourcesModal />
    <PartyModal />
    <EncounterModal />

    <NotificationArea />
  </div>
</template>

<style>
@import "../node_modules/@vueform/multiselect/themes/tailwind.scss";
</style>

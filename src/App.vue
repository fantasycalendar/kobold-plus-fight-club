<script setup>
import { RouterView } from "vue-router";
import HeaderNav from "./components/HeaderNav.vue";

import ImporterModal from "./components/ImporterModal.vue";
import KeyboardModal from "./components/KeyboardModal.vue";
import SourcesModal from "./components/SourcesModal.vue";
import GeneratorModal from "./components/GeneratorModal.vue";
import PartyModal from "./components/PartyModal.vue";
import EncounterModal from "./components/EncounterModal.vue";

import NotificationArea from "./components/NotificationArea.vue";
import { useMonsters } from "./stores/monsters";
import { useSources } from "./stores/sources";
import { useModals } from "./stores/modals";
import { onMounted, ref, watch } from "vue";
import { useHotkeys } from "./stores/hotkeys";

const monsters = useMonsters();
const sources = useSources();
const hotkeys = useHotkeys();
const modals = useModals();

const theme = ref(window.theme);

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme.value === "dark");
}

onMounted(async () => {
  await sources.fetch();
  await monsters.fetch();

  watch(theme, (value) =>
    document.documentElement.classList.toggle("dark", value === "dark")
  );

  hotkeys.register(
    "ctrl+shift+\\",
    "Toggles light/dark theme",
    () => {
      toggleTheme();
      return false;
    },
    30
  );

  hotkeys.register(
    "esc",
    "Closes any open dialogs",
    () => {
      modals.closeAll();
    },
    90
  );
});
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-300 flex flex-col"
  >
    <HeaderNav v-model:theme="theme" />

    <RouterView />

    <ImporterModal />
    <KeyboardModal />
    <GeneratorModal />
    <SourcesModal />
    <PartyModal />
    <EncounterModal />

    <NotificationArea />
  </div>
</template>

<style>
@import "../node_modules/@vueform/multiselect/themes/tailwind.scss";
</style>

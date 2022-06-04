<script setup>
import Modal from "./Modal.vue";
import { useModals } from "../stores/modals";
import { onBeforeMount } from "vue";
import hotkeys from "hotkeys-js";

const modals = useModals();

const keyboardHelp = [
  { key: "ctrl+f", description: "Toggle the filters sidebar" },
  { key: "ctrl+/", description: "Displays this help window" },
  { key: "ctrl+shift+\\", description: "Toggles light/dark theme" },
  { key: "ctrl+]", description: "Next monsters search page" },
  { key: "ctrl+k", description: "Focus the search box" },
  { key: "ctrl+[", description: "Previous monsters search page" },
  { key: "ctrl+g", description: "Generate an encounter" },
  { key: "ctrl+s", description: "Save the current encounter" },
  { key: "esc", description: "Close any open dialogs" },
];

onBeforeMount(() => {
  hotkeys("ctrl+/", () => {
    modals.toggle("keyboard");

    return false;
  });
});
</script>

<template>
  <Modal v-model:show="modals.keyboard" title="Keyboard Shortcuts">
    <div class="my-3 sm:mt-0 w-full">
      <div
        class="my-2 max-h-96 overflow-y-auto overflow-x-hidden text-gray-700 dark:text-gray-300"
      >
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          <div v-for="shortcut in keyboardHelp">
            <div class="flex justify-between">
              <kbd
                class="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-sm font-sans font-medium text-gray-400"
                v-text="shortcut.key"
              ></kbd>
              <div v-text="shortcut.description"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="modals.hide('keyboard')"
        type="button"
        class="button-primary-md"
      >
        Close
      </button>
    </template>
  </Modal>
</template>

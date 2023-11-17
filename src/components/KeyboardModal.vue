<script setup>
import Modal from "./Modal.vue";
import { useModals } from "../stores/modals";
import { useHotkeys } from "../stores/hotkeys";
import { onBeforeMount } from "vue";

const modals = useModals();
const hotkeys = useHotkeys();
const mac = navigator.platform.startsWith('Mac');

// If the hotkey is "ctrl+/, command+/", then we want to only display "⌘+/" on Mac
// and "Ctrl+/" everywhere else. If the hotkey has no ctrl or command modifiers, 
// such as "esc", then we want to display just "Esc" everywhere.
function formatHotkey(hotkey) {
    return (hotkey.includes("ctrl") && hotkey.includes("command")) 
      ? hotkey.split(", ")[mac ? 1 : 0].replace("command", "⌘").replace("ctrl", "Ctrl")
      : hotkey.slice(0, 1).toUpperCase() + hotkey.slice(1);
}

onBeforeMount(() => {
  hotkeys.register(
    "ctrl+/, command+/",
    "Displays this help window",
    () => {
      modals.toggle("keyboard");

      return false;
    },
    10
  );
});
</script>

<template>
  <Modal v-model:show="modals.keyboard" title="Keyboard Shortcuts">
    <div class="my-3 sm:mt-0 w-full">
      <div
        class="my-2 max-h-96 overflow-y-auto overflow-x-hidden text-gray-700 dark:text-gray-300"
      >
        <div class="grid grid-cols-2 gap-x-8 gap-y-3">
          <div v-for="hotkey in hotkeys.help" :key="hotkey.shortcut">
            <div class="flex justify-between">
              <kbd
                class="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-sm font-sans font-medium text-gray-400"
                v-text="formatHotkey(hotkey.shortcut)"
              ></kbd>
              <div v-text="hotkey.description"></div>
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

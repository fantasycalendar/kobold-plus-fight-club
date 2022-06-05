<script setup>
import Modal from "./Modal.vue";
import { useModals } from "../stores/modals";
import { useHotkeys } from "../stores/hotkeys";
import { onBeforeMount } from "vue";

const modals = useModals();
const hotkeys = useHotkeys();

onBeforeMount(() => {
  hotkeys.register(
    "ctrl+/",
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
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          <div v-for="hotkey in hotkeys.help" :key="hotkey.shortcut">
            <div class="flex justify-between">
              <kbd
                class="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-sm font-sans font-medium text-gray-400"
                v-text="hotkey.shortcut"
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

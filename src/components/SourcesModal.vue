<script setup>
import Modal from "./Modal.vue";
import SourcesModalType from "./SourcesModalType.vue";

import { useModals } from "../stores/modals";
import { useSources } from "../stores/sources";

const sources = useSources();
const modals = useModals();

function switchToImport() {
  modals.hide("sources");
  modals.show("importer");
}
</script>

<template>
  <Modal v-model:show="modals.sources" title="Select your sources">
    <button
      class="button-primary-outline-md absolute top-5 right-6 !py-1"
      @click="switchToImport"
    >
      <i class="fa fa-plus mr-1 text-lg"></i> Import new
    </button>
    <div
      class="mt-2 max-h-96 overflow-y-auto px-1 scrollbar scrollbar-dark w-full"
    >
      <SourcesModalType
        v-for="type of sources.byType"
        :key="type.title"
        :type="type"
      ></SourcesModalType>
    </div>

    <template #footer>
      <button
        @click="modals.hide('sources')"
        type="button"
        class="button-primary-md"
      >
        Done
      </button>
    </template>
  </Modal>
</template>

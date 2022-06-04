<script setup>
import Modal from "./Modal.vue";
import SourcesModalSource from "./SourcesModalSource.vue";
import { ref, computed } from "vue";

import { useModals } from "../stores/modals";
import { useSources } from "../stores/sources";

const sources = useSources();
const modals = useModals();
</script>

<template>
  <Modal v-model:show="modals.sources" title="Select your sources">
    <div class="mt-2 max-h-96 overflow-y-auto px-1 scrollbar scrollbar-dark">
      <div
        v-for="type of sources.byType"
        :key="type.title"
      >
        <div class="mb-4">
          <h4
            class="text-gray-700 dark:text-gray-300 leading-6 mb-2"
            v-text="type.title"
          ></h4>

          <div class="grid gap-2 grid-cols-6 md:grid-cols-12 w-full">
            <div v-for="source of type.sources" :key="source.name">
              <SourcesModalSource :source="source" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      @click="modals.hide('sources')"
      type="button"
      class="button-primary-md"
    >
      Done
    </button>
  </Modal>
</template>

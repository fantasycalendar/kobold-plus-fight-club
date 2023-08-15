<script setup>
import Modal from "./Modal.vue";
import { useModals } from "../stores/modals.js";
import { useEncounter } from "../stores/encounter.js";
import SelectInput from "./SelectInput.vue";

const modals = useModals();
const encounter = useEncounter();

</script>

<template>

  <Modal v-model:show="modals.strategy" title="Select encounter strategy">

    <div class="grid gap-2 w-full place-items-end sm:grid-cols-8 grow">
      <div class="w-full col-span-1 sm:col-span-3">
        <SelectInput
            v-model="encounter.strategy"
            :label="encounter.availableStrategies[encounter.strategy].label"
            :options="Object.entries(encounter.availableStrategies).map(strategy => ({
              key: strategy[0],
              label: strategy[1].label
            }))"
            name="encounter_strategy"
            id="encounter_strategy"
        >
        </SelectInput>
      </div>
    </div>

    <template #footer>
      <button
          @click="modals.hide('strategy')"
          type="button"
          class="button-primary-md"
      >
        Done
      </button>
    </template>

  </Modal>

</template>

<script setup>
import Modal from "./Modal.vue";
import { useModals } from "../stores/modals.js";
import { useEncounter } from "../stores/encounter.js";
import SelectInput from "./SelectInput.vue";

const modals = useModals();
const encounter = useEncounter();

</script>

<template>

  <Modal v-model:show="modals.generator" title="Select encounter generator">

    <div class="grid gap-2 w-full place-items-end sm:grid-cols-8 grow">
      <div class="w-full col-span-1 sm:col-span-3">
        <SelectInput
            v-model="encounter.generator"
            :label="encounter.availableGenerators[encounter.generator].label"
            :options="Object.entries(encounter.availableGenerators).map(generator => ({
              key: generator[0],
              label: generator[1].label
            }))"
            name="encounter_generator"
            id="encounter_generator"
        >
        </SelectInput>
      </div>
    </div>

    <template #footer>
      <button
          @click="modals.hide('generator')"
          type="button"
          class="button-primary-md"
      >
        Done
      </button>
    </template>

  </Modal>

</template>

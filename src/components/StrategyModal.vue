<script setup>
import Modal from "./Modal.vue";
import { useModals } from "../stores/modals.js";
import { useEncounter } from "../stores/encounter.js";

const modals = useModals();
const encounter = useEncounter();
</script>

<template>
  <Modal v-model:show="modals.strategy" title="Select encounter generation strategy">
    <div class="grid gap-2 w-full place-items-end md:grid-cols-2 grow items-stretch">
      <div
        v-for="[key, strategy] in Object.entries(encounter.availableStrategies)"
        :key="key"
        @click="encounter.setStrategy(key)"
        class="bg-white dark:bg-gray-700 shadow rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-2 hover:border-emerald-500 transition duration-150 ease-in-out"
        :class="{
          'border-emerald-500': encounter.strategy === key,
          'border-transparent': encounter.strategy !== key,
        }"
      >
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-200"
            >
              {{ strategy.label }}
              <a class="underline text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-400" v-if="strategy.url" :href="strategy.url" @click.stop target="_blank">
                <i class="fas fa-link"></i>
              </a>
            </h3>

            <span
              v-if="encounter.strategy === key"
              :class="{
                'text-green-500': encounter.strategy === key,
              }"
            >
              <i class="fas fa-check"></i>
            </span>
          </div>
          <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p v-html="strategy.description"></p>
          </div>
        </div>
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

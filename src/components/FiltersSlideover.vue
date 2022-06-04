<template>
  <div
    class="fixed 2xl:static 2xl:pointer-events-none inset-0 z-50 2xl:z-0 overflow-hidden"
    aria-labelledby="slide-over-title"
    role="dialog"
    aria-modal="true"
    v-show="showFilters"
    v-cloak
  >
    <div class="absolute 2xl:static inset-0 overflow-hidden">
      <!-- Background overlay, show/hide based on slide-over state. -->
      <transition
        enter-active-class="ease-in-out duration-200"
        enter-from-class="opacity-0 2xl:opacity-100"
        enter-to-class="opacity-100"
        leave-active-class="ease-in-out duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 2xl:opacity-100"
      >
        <div
          @click="$emit('close')"
          class="absolute 2xl:hidden inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity 2xl:duration-0"
          aria-hidden="true"
          v-show="showFilters"
        ></div>
      </transition>

      <div
        class="pointer-events-none fixed 2xl:static inset-y-0 right-0 flex max-w-full pl-10"
      >
        <transition
          enter-active-class="transform transition ease-in-out duration-200"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transform transition ease-in-out duration-200"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            class="pointer-events-auto w-screen max-w-md 2xl:!duration-[0ms] sm:duration-700"
            v-show="showFilters"
          >
            <div
              class="relative 2xl:static flex max-h-screen h-full flex-col overflow-y-hidden bg-white dark:bg-gray-800 shadow-xl"
            >
              <div
                class="px-4 sm:px-6 border-b dark:border-gray-700 py-6 2xl:hidden"
              >
                <div class="flex items-start justify-between">
                  <h2
                    class="text-lg font-medium text-gray-900 dark:text-gray-200"
                    id="slide-over-title"
                  >
                    Filter monsters
                  </h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button
                      @click="$emit('close')"
                      type="button"
                      class="rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <span class="sr-only">Close panel</span>
                      <!-- Heroicon name: outline/x -->
                      <svg
                        class="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div
                class="flex h-full flex-col relative 2xl:absolute 2xl:inset-y-0 2xl:w-[24rem] 2xl:right-0 2xl:py-8 flex-1 px-4 py-6 sm:px-6 space-y-4 overflow-y-auto scrollbar"
              >
                <div class="flex">
                  <button
                    @click="modals.show('sources')"
                    class="button-primary-md w-full"
                  >
                    <span class="w-full text-center">Manage sources</span>
                  </button>

                  <button
                    :disabled="!filters.nonDefault"
                    @click="filters.reset()"
                    class="w-full button-secondary-md disabled:opacity-70 disabled:bg-slate-200 disabled:hover:bg-slate-200 disabled:dark:bg-slate-700 disabled:dark:hover:bg-slate-700 disabled:hover:text-emerald-700 disabled:dark:hover:text-emerald-600 grid place-items-center text-center hidden 2xl:block ml-2"
                  >
                    <span class="inline-block w-full"
                      ><i class="fa fa-undo pr-1"></i> Reset Filters</span
                    >
                  </button>
                </div>

                <ChallengeRatingSlider />
                <!-- Multi Select -->
                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Size category
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any size"
                    v-model="filters.size"
                    :options="filters.sizeOptions"
                  ></Multiselect>
                </div>

                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Creature type
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any type"
                    v-model="filters.type"
                    :options="filters.typeOptions"
                  ></Multiselect>
                </div>

                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Native Environment
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any Environment"
                    v-model="filters.environment"
                    :options="filters.environmentOptions"
                  ></Multiselect>
                </div>

                <div>
                  <div
                    class="block font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Legendary Status
                  </div>

                  <Multiselect
                    mode="tags"
                    placeholder="Any Legendary"
                    v-model="filters.legendary"
                    :options="filters.legendaryOptions"
                  ></Multiselect>
                </div>
                <AlignmentGrid></AlignmentGrid>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import Multiselect from "@vueform/multiselect";
import AlignmentGrid from "./AlignmentGrid.vue";
import { useFilters } from "../stores/filters.js";
import ChallengeRatingSlider from "./ChallengeRatingSlider.vue";
import {useModals} from "../stores/modals";

const filters = useFilters();
const modals = useModals();

defineProps({
  showFilters: {
    type: Boolean,
    default: false,
  },
});
</script>

<style src="@vueform/multiselect/themes/default.css"></style>

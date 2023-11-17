<script setup>
import { onMounted, ref } from "vue";
import { useFilters } from "../stores/filters.js";
import { useHotkeys } from "../stores/hotkeys";

const filters = useFilters();
const hotkeys = useHotkeys();

const keyboardText = ref(
  navigator.platform.toLowerCase().includes("mac") ? "⌘K" : "Ctrl K"
);

const searchBox = ref(null);

onMounted(() => {
  hotkeys.register(
    "ctrl+k, command+k",
    "Focus the search box",
    () => {
      searchBox.value.focus();
      return false;
    },
    50
  );
});
</script>

<template>
  <div>
    <label
      for="search"
      class="max-w-full block text-sm font-medium text-gray-700 sr-only"
      >Search monsters</label
    >

    <div class="px-4 sm:px-6 lg:px-8">
      <div
        class="max-w-full mt-1 flex flex-col lg:flex-row rounded-md shadow-sm"
      >
        <div class="relative items-stretch grow focus-within:z-10">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            type="search"
            name="search"
            id="search"
            ref="searchBox"
            v-model="filters.search"
            class="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-md lg:rounded-r-none pl-10 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600"
            :placeholder="filters.searchPlaceholder"
          />

          <div
            class="absolute inset-y-0 right-0 py-1.5 pr-2 grid place-items-center"
            :class="{ 'right-8': filters.search.length }"
          >
            <kbd
              class="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-sm font-sans font-medium text-gray-400"
              v-text="keyboardText"
            ></kbd>
          </div>
        </div>

        <div class="flex w-full lg:w-auto mt-2 lg:mt-0">
          <div class="w-full lg:w-auto">
            <select
              id="monstersPerPage"
              v-model="filters.perPage"
              name="location"
              class="block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-l-md lg:rounded-none 2xl:rounded-r-md border-gray-300 border-l-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600"
            >
              <option
                v-for="option in [10, 25, 50, 100]"
                :key="option"
                :value="option"
                :selected="filters.perPage === option"
              >
                {{ option }} per page
              </option>
            </select>
          </div>

          <div
            class="relative inline-block text-left 2xl:hidden"
            title="Filter monsters (Ctrl+L)"
          >
            <button
              @click="$emit('toggle-filters')"
              type="button"
              class="-ml-px h-full relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md bg-white disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-400 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filter</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-300 text-gray-800"
                v-show="filters.activeCount > 0"
                v-text="filters.activeCount"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

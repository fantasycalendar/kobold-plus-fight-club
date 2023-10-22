<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { useMonsters } from "../stores/monsters";
import { useSources } from "../stores/sources";
import { useFilters } from "../stores/filters";
import { useModals } from "../stores/modals";
import { useHotkeys } from "../stores/hotkeys";

import LoadingSpinner from "./LoadingSpinner.vue";
import MonsterTableHeading from "./MonsterTableHeading.vue";
import MonsterTableRow from "./MonsterTableRow.vue";

const emit = defineEmits(["modal"]);

const sortBy = ref("name");
const sortByDesc = ref(false);
const totalPages = ref(0);

const monsters = useMonsters();
const sources = useSources();
const filters = useFilters();
const modals = useModals();
const hotkeys = useHotkeys();

const currentPage = ref(1);

function setSortBy(sortColumn) {
  if (sortColumn === sortBy.value) {
    sortByDesc.value = !sortByDesc.value;
  } else {
    sortByDesc.value = false;
  }
  sortBy.value = sortColumn;
}

const pagination = computed(() => {
  totalPages.value = Math.ceil(
    (monsters.filtered.length - 1) / filters.perPage
  );
  currentPage.value = Math.max(
    1,
    Math.min(totalPages.value, currentPage.value)
  );

  if (totalPages.value <= 5) {
    return Array(totalPages.value)
      .fill({})
      .map((page, index) => {
        return {
          number: index + 1,
          active: currentPage.value === index + 1,
        };
      });
  } else if (currentPage.value < 5) {
    return [
      { number: 1, active: currentPage.value === 1 },
      { number: 2, active: currentPage.value === 2 },
      { number: 3, active: currentPage.value === 3 },
      { number: 4, active: currentPage.value === 4 },
      { number: 5, active: currentPage.value === 5 },
      { divider: true },
      { number: totalPages.value },
    ];
  } else if (currentPage.value > totalPages.value - 5) {
    return [
      { number: 1 },
      { divider: true },
      {
        number: totalPages.value - 4,
        active: totalPages.value - 4 === currentPage.value,
      },
      {
        number: totalPages.value - 3,
        active: totalPages.value - 3 === currentPage.value,
      },
      {
        number: totalPages.value - 2,
        active: totalPages.value - 2 === currentPage.value,
      },
      {
        number: totalPages.value - 1,
        active: totalPages.value - 1 === currentPage.value,
      },
      {
        number: totalPages.value,
        active: totalPages.value === currentPage.value,
      },
    ];
  } else {
    return [
      { number: 1 },
      { divider: true },
      { number: currentPage.value - 1 },
      { number: currentPage.value, active: true },
      { number: currentPage.value + 1 },
      { divider: true },
      { number: totalPages.value },
    ];
  }
});

onBeforeMount(() => {
  hotkeys.register(
    "ctrl+[",
    "Previous monsters search page",
    () => {
      currentPage.value--;
      return false;
    },
    60
  );

  hotkeys.register(
    "ctrl+]",
    "Next monsters search page",
    () => {
      currentPage.value++;
      return false;
    },
    40
  );
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div
      v-show="!monsters.loading"
      class="-mx-4 mt-8 overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg"
    >
      <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              scope="col"
              class="py-3.5 px-3 text-center text-sm font-semibold text-gray-900 sm:pl-6 w-8 max-w-8"
            >
              <span class="sr-only">Add to encounter</span>
            </th>
            <MonsterTableHeading
              label="Name"
              sorts-column="name"
              :sort-by="sortBy"
              :sort-by-desc="sortByDesc"
              class="table-cell w-64"
              @sort="setSortBy($event)"
            />
            <MonsterTableHeading
              label="Alignment"
              class="hidden xl:table-cell w-32 text-right pr-4"
            />
            <MonsterTableHeading
              label="Size"
              sorts-column="size"
              :sort-by="sortBy"
              :sort-by-desc="sortByDesc"
              class="table-cell w-32"
              @sort="setSortBy($event)"
            />
            <MonsterTableHeading
              label="Type"
              sorts-column="type"
              :sort-by="sortBy"
              :sort-by-desc="sortByDesc"
              class="hidden lg:table-cell w-32"
              @sort="setSortBy($event)"
            />
            <MonsterTableHeading
              label="CR"
              sorts-column="cr.numeric"
              :sort-by="sortBy"
              :sort-by-desc="sortByDesc"
              @sort="setSortBy($event)"
              class="hidden sm:table-cell w-32"
            />
          </tr>
        </thead>
        <tbody
          class="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-900"
        >
          <MonsterTableRow
            v-for="monster in monsters.paginated(currentPage, sortBy, sortByDesc)"
            :key="monster.slug"
            :monster="monster"
          ></MonsterTableRow>
        </tbody>
      </table>
    </div>
    <div
      v-show="monsters.loading"
      class="min-h-32 w-full grid place-items-center py-20"
    >
      <LoadingSpinner :message="true" />
    </div>

    <div
      v-show="!monsters.loading && sources.enabled.length === 0"
      class="w-full text-center text-lg my-4"
    >
      No sources are enabled -
      <span
        class="primary-link select-none cursor-pointer"
        @click="modals.show('sources')"
        >enable some now</span
      >
    </div>
    <div
      v-show="
        !monsters.loading &&
        sources.enabled.length > 0 &&
        monsters.filtered.length === 0
      "
      class="w-full text-center text-lg my-4"
      v-cloak
    >
      No monsters found with the current filter -
      <span
        class="primary-link select-none cursor-pointer"
        @click="filters.reset()"
        >reset filters</span
      >
    </div>

    <!-- This example requires Tailwind CSS v2.0+ -->
    <nav
      v-show="!monsters.loading && totalPages > 1"
      v-cloak
      class="border-t border-gray-300 mt-4 dark:border-gray-700 px-4 flex items-center justify-between sm:px-0"
    >
      <div class="-mt-px w-0 flex-1 flex">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="border-t-2 border-transparent pt-4 px-2 lg:pr-1 lg:pl-0 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 dark:text-gray-400 dark:hover:text-gray-300 disabled:pointer-events-none disabled:opacity-40"
        >
          <!-- Heroicon name: solid/arrow-narrow-left -->
          <svg
            class="mr-3 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="hidden lg:inline">Previous</span>
        </button>
      </div>
      <div class="hidden md:-mt-px md:flex">
        <span
          v-for="page of pagination"
          :class="{
            'cursor-pointer select-none border-emerald-600 text-emerald-600 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium':
              page.active && !page.divider,
            'cursor-pointer select-none border-transparent text-gray-500 hover:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium hidden lg:inline-block first-of-type:inline-block last-of-type:inline-block':
              !page.active && !page.divider,
            'select-none border-transparent text-gray-500 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium':
              page.divider,
          }"
          v-text="page.divider ? '...' : page.number"
          @click="currentPage = page.number"
          :key="page.number"
        ></span>
      </div>
      <div class="-mt-px w-0 flex-1 flex justify-end">
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="border-t-2 border-transparent pt-4 px-2 lg:pr-1 lg:pl-0 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 dark:text-gray-400 dark:hover:text-gray-300 disabled:pointer-events-none disabled:opacity-40"
        >
          <span class="hidden lg:inline">Next</span>
          <!-- Heroicon name: solid/arrow-narrow-right -->
          <svg
            class="ml-3 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </nav>
  </div>
</template>

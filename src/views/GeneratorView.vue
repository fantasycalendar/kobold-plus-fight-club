<script setup></script>

<script>
import hotkeys from "hotkeys-js";
import CONST from "../js/constants.js";
import FiltersSlideover from "../components/FiltersSlideover.vue";
import MonsterTable from "../components/MonsterTable.vue";
import SearchBox from "../components/SearchBox.vue";
import PartyPanel from "../components/PartyPanel.vue";
import EncounterPanel from "../components/EncounterPanel.vue";

import { useEncounter } from "../stores/encounter";

export default {
  components: {
    SearchBox,
    FiltersSlideover,
    MonsterTable,
    PartyPanel,
    EncounterPanel,
  },
  emits: ["modal"],

  setup() {
    const encounter = useEncounter();

    return {
      encounter,
      CONST,
    };
  },

  data() {
    return {
      showFilters: false,
      mobileEncounterTab: false,
    };
  },

  methods: {
    setupHotkeys() {
      hotkeys(
        "ctrl+/,ctrl+k,ctrl+shift+\\,ctrl+f,ctrl+[,ctrl+],ctrl+g,ctrl+s,esc",
        (event, handler) => {
          switch (handler.key) {
            case "ctrl+/":
              this.showKeyboardModal = !this.showKeyboardModal;
              return false;
            case "ctrl+k":
              document.getElementById("search").focus();
              return false;
            case "ctrl+shift+\\":
              this.toggleTheme();
              return false;
            case "ctrl+f":
              this.showFilters =
                Math.max(
                  document.body.scrollWidth,
                  document.documentElement.scrollWidth,
                  document.body.offsetWidth,
                  document.documentElement.offsetWidth,
                  document.documentElement.clientWidth
                ) > 1535
                  ? true
                  : (this.showFilters = !this.showFilters);
              return false;
            case "ctrl+s":
              this.encounter.save();
              return false;
            case "ctrl+g":
              this.encounter.generateRandom();
              return false;
            case "esc":
              this.showPartyModal = false;
              this.showKeyboardModal = false;
              this.showFilters =
                Math.max(
                  document.body.scrollWidth,
                  document.documentElement.scrollWidth,
                  document.body.offsetWidth,
                  document.documentElement.offsetWidth,
                  document.documentElement.clientWidth
                ) > 1535;
              this.showSourcesModal = false;
              break;
          }

          return true;
        }
      );
    },
  },

  created() {
    this.setupHotkeys();
    // this.encounter.app = this;
    // this.party.app = this;
    // this.fetchData();

    if (
      Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      ) > 1535
    ) {
      this.showFilters = true;
    }
  },
};
</script>

<template>
  <div
    class="flex py-4 sm:py-6 lg:py-8 w-full max-w-[2560px] relative grow mx-auto flex-col md:flex-row"
  >
    <div
      class="relative self-center mb-6 bg-gray-200 dark:bg-gray-800 rounded-lg p-0.5 flex sm:mt-8 h-10 md:hidden"
    >
      <div
        class="absolute bg-gray-100 dark:bg-gray-700 w-1/2 transition-all duration-300 inset-y-1 rounded-md"
        :class="{
          'translate-x-full -ml-1.5': mobileEncounterTab,
          'left-1': !mobileEncounterTab,
        }"
      ></div>
      <button
        @click="mobileEncounterTab = false"
        type="button"
        :class="{
          'text-gray-900 ': !mobileEncounterTab,
          'text-gray-700': mobileEncounterTab,
        }"
        class="relative border-gray-200 rounded-md shadow-sm py-2 text-sm font-medium dark:text-gray-100 whitespace-nowrap focus:outline-none focus:z-10 w-40"
      >
        Encounter
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 dark:bg-gray-300 text-gray-800"
          v-text="
            encounter.groups.reduce((carry, item) => carry + item.count, 0)
          "
          v-show="encounter.groups.length"
        ></span>
      </button>
      <button
        @click="mobileEncounterTab = true"
        type="button"
        :class="{
          'text-gray-900 ': mobileEncounterTab,
          'text-gray-700': !mobileEncounterTab,
        }"
        class="ml-0.5 relative border border-transparent rounded-md py-2 text-sm font-medium whitespace-nowrap dark:text-gray-100 focus:outline-none focus:z-10 w-40"
      >
        Monsters
      </button>
    </div>

    <div
      id="monsters_box"
      :class="{ 'hidden md:block': !mobileEncounterTab }"
      class="grow px-4 md:pr-0 md:absolute md:inset-y-0 md:py-8 left-0 right-0 md:inset-none md:pl-[28rem] 2xl:right-[24rem] overflow-y-auto scrollbar"
    >
      <SearchBox @toggle-filters="showFilters = !showFilters" />
      <MonsterTable @modal="$emit('modal', $event)"></MonsterTable>
    </div>

    <div
      id="encounter_box"
      :class="{ 'hidden md:flex': mobileEncounterTab }"
      class="md:absolute md:inset-y-0 md:py-8 md:left-4 md:pr-4 md:pl-4 pb-8 md:flex w-full px-8 2xl:pr-4 flex-col flex-shrink-0 md:w-[28rem] overflow-y-auto scrollbar"
    >
      <PartyPanel></PartyPanel>
      <EncounterPanel></EncounterPanel>
    </div>

    <FiltersSlideover
      :show-filters="showFilters"
      @close="showFilters = false"
    />
  </div>
</template>

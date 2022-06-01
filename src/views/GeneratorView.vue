<script setup></script>

<script>
import Choices from "choices.js";
import hotkeys from "hotkeys-js";
import encounter from "../js/encounter.js";
import noUiSlider from "nouislider";
import * as helpers from "../js/helpers.js";
import CONST from "../js/constants.js";
import Monster from "../js/monster.js";
import tippy from "tippy.js";
import FiltersSlideover from "../components/FiltersSlideover.vue";
import MonsterTable from "../components/MonsterTable.vue";

import { useMonsters } from "../stores/monsters";

const internationalNumberFormat = new Intl.NumberFormat("en-US");

export default {
  components: { FiltersSlideover, MonsterTable },
  emits: ["modal"],

  setup() {
    const monsterStore = useMonsters();

    return {
      monsterStore
    }
  },

  data() {
    return {
      sourcesVersion: "2.1.0",
      storedSourcesVersion: "2.0.0",

      showFilters: false,
      showSourcesModal: false,
      showEncounterModal: false,
      showPartyModal: false,
      showImporterModal: false,

      mobileEncounterTab: false,

      searchKeyboardShortcut: navigator.platform.toLowerCase().includes("mac")
        ? "⌘K"
        : "Ctrl K",
      filters: {},
      searchPlaceholder: "",
      nonDefaultFiltersCount: 0,

      loadedSources: [],
      loadedMonsters: [],
      tab: "history",

      encounterHistory: [],
      savedEncounters: [],

      loadedEncounterIndex: null,
      loadedLastEncounter: false,
      sourcesByType: [],

      savedParties: [],

      sources: {},
      enabledSources: [],

      allMonsters: [],
      filteredMonsters: [],
      monsterLookupTable: {},

      environments: {},

      totalPages: 1,
      currentPage: 1,
      pagination: [],
      monstersPerPage: 10,

      encounterType: "random",
      encounterTypeSelectOpen: false,
      encounterTypes: Object.fromEntries(
        Object.entries(CONST.ENCOUNTER_TYPES).map((entry) => {
          return [entry[0], { key: entry[0], label: entry[1].name }];
        })
      ),

      difficultySelectOpen: false,
      difficulty: "medium",
      search: "",

      encounter: encounter,

      sortBy: "name",
      sortByDesc: true,

      timer: null,

      party: {
        groups: [{ players: 4, level: 1, getsXP: true }],

        addPlayerGroup() {
          const lastGroup = this.groups[this.groups.length - 1] ?? {
            players: 4,
            level: 1,
            getsXP: true,
          };

          this.groups.push({ ...lastGroup });
        },

        removePlayerGroup(index) {
          this.groups.splice(index, 1);
        },

        get experience() {
          const experience = this.groups.reduce(this.getGroupExperience, {});
          return this.app.activePlayers.reduce(
            this.getGroupExperience,
            experience
          );
        },

        getGroupExperience(acc, group) {
          const groupExp = CONST.EXP[group.level];
          return {
            easy: (acc?.easy ?? 0) + groupExp.easy * (group?.players ?? 1),
            medium:
              (acc?.medium ?? 0) + groupExp.medium * (group?.players ?? 1),
            hard: (acc?.hard ?? 0) + groupExp.hard * (group?.players ?? 1),
            deadly:
              (acc?.deadly ?? 0) + groupExp.deadly * (group?.players ?? 1),
            daily: (acc?.daily ?? 0) + groupExp.daily * (group?.players ?? 1),
          };
        },
      },
    };
  },

  computed: {
    keyboardText() {
      return navigator.platform.toLowerCase().includes("mac") ? "⌘K" : "Ctrl K";
    },
    totalPlayers() {
      return (
        this.groups.reduce((acc, group) => {
          return acc + parseInt(group.players);
        }, 0) + this.app.activePlayers.length
      );
    },

    totalPlayersToGainXP() {
      return (
        this.groups.reduce((acc, group) => {
          return acc + (group.getsXP ? parseInt(group.players) : 0);
        }, 0) + this.app.activePlayers.length
      );
    },

    totalExperiencePerPlayer() {
      return Math.round(
        this.app.encounter.totalExp / this.totalPlayersToGainXP
      );
    },

    totalAdjustedExperiencePerPlayer() {
      return Math.round(
        this.app.encounter.adjustedExp / this.totalPlayersToGainXP
      );
    },

    activePlayers() {
      return this.savedParties.reduce((acc, party) => {
        return acc.concat(party.players.filter((player) => player.active));
      }, []);
    },

    monsters() {
      const currentPage = this.currentPage - 1;
      const start = !currentPage ? 0 : currentPage * this.monstersPerPage + 1;
      const end = !currentPage
        ? this.monstersPerPage
        : (currentPage + 1) * this.monstersPerPage + 1;
      return this.filteredMonsters.slice(start, end);
    },
  },

  methods: {
    playerChange(player) {
      if (player.currentHp > player.maxHp) {
        player.maxHp = player.currentHp;
      }
    },
    showDifficultySelect() {
      this.difficultySelectOpen = true;
      console.log(this.difficultySelectOpen);
    },

    hideDifficultySelect() {
      this.difficultySelectOpen = false;
      console.log(this.difficultySelectOpen);
    },

    setSortBy(type) {
      if (type === this.sortBy) {
        this.sortByDesc = !this.sortByDesc;
      } else {
        this.sortByDesc = true;
      }
      this.sortBy = type;
      this.updateFilteredMonsters();
    },

    toggleTheme() {
      let theme = localStorage.theme === "dark" ? "light" : "dark";
      this.theme = theme;
      window.theme = theme;
      localStorage.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
    },

    enablePartyModal() {
      this.showPartyModal = true;

      if (this.savedParties.length === 1) {
        this.savedParties[0].editing = true;
      }
    },

    createParty() {
      this.savedParties.forEach((party) => (party.editing = false));
      this.savedParties.push({
        name: "Party " + (this.savedParties.length + 1),
        editing: true,
        players: [],
      });
      this.createPlayer(this.savedParties.length - 1);
    },

    activateParty(partyIndex) {
      this.savedParties[partyIndex].players.forEach(
        (player) => (player.active = true)
      );
    },

    deactivateParty(partyIndex) {
      this.savedParties[partyIndex].players.forEach(
        (player) => (player.active = false)
      );
    },

    deleteParty(partyIndex) {
      this.savedParties.splice(partyIndex, 1);
    },

    createPlayer(partyIndex) {
      this.savedParties[partyIndex].players.push({
        name: "Player " + (this.savedParties[partyIndex].players.length + 1),
        initiativeMod: 0,
        initiativeAdvantage: false,
        level:
          this.savedParties[partyIndex].players[
            this.savedParties[partyIndex].players.length - 1
          ]?.level ?? 1,
        maxHp:
          this.savedParties[partyIndex].players[
            this.savedParties[partyIndex].players.length - 1
          ]?.maxHp ?? 10,
        currentHp:
          this.savedParties[partyIndex].players[
            this.savedParties[partyIndex].players.length - 1
          ]?.currentHp ?? 10,
        active: false,
        partyIndex: 0,
      });
    },

    deletePlayer(partyIndex, playerIndex) {
      this.savedParties[partyIndex].players.splice(playerIndex, 1);
    },

    async fetchData() {
      this.formatSources(await this.fetchSources());
      this.formatMonsters(await this.fetchMonsters());
      this.searchPlaceholder = helpers.randomArrayElement(
        this.allMonsters
      ).name;

      if (this.loadedEncounterIndex !== null) {
        this.encounter.load(this.savedEncounters[this.loadedEncounterIndex]);
      } else if (this.encounterHistory.length && this.loadedLastEncounter) {
        this.encounter.load(
          this.encounterHistory[this.encounterHistory.length - 1]
        );
      }
    },

    setPage(page) {
      if (page.divider) return;
      this.setPageNumber(page.number);
    },

    setPageNumber(num) {
      this.currentPage = num;
      this.updatePagination();
    },

    setMonstersPerPage(num) {
      this.monstersPerPage = num;
      this.updatePagination();
    },

    updatePagination() {
      this.totalPages = Math.ceil(
        (this.filteredMonsters.length - 1) / this.monstersPerPage
      );
      this.currentPage = Math.max(
        1,
        Math.min(this.totalPages, this.currentPage)
      );

      if (this.totalPages <= 5) {
        this.pagination = Array(this.totalPages)
          .fill({})
          .map((page, index) => {
            return {
              number: index + 1,
              active: this.currentPage === index + 1,
            };
          });
      } else if (this.currentPage < 5) {
        this.pagination = [
          { number: 1, active: this.currentPage === 1 },
          { number: 2, active: this.currentPage === 2 },
          { number: 3, active: this.currentPage === 3 },
          { number: 4, active: this.currentPage === 4 },
          { number: 5, active: this.currentPage === 5 },
          { divider: true },
          { number: this.totalPages },
        ];
      } else if (this.currentPage > this.totalPages - 5) {
        this.pagination = [
          { number: 1 },
          { divider: true },
          {
            number: this.totalPages - 4,
            active: this.totalPages - 4 === this.currentPage,
          },
          {
            number: this.totalPages - 3,
            active: this.totalPages - 3 === this.currentPage,
          },
          {
            number: this.totalPages - 2,
            active: this.totalPages - 2 === this.currentPage,
          },
          {
            number: this.totalPages - 1,
            active: this.totalPages - 1 === this.currentPage,
          },
          {
            number: this.totalPages,
            active: this.totalPages === this.currentPage,
          },
        ];
      } else {
        this.pagination = [
          { number: 1 },
          { divider: true },
          { number: this.currentPage - 1 },
          { number: this.currentPage, active: true },
          { number: this.currentPage + 1 },
          { divider: true },
          { number: this.totalPages },
        ];
      }
    },

    async fetchSources() {
      if (
        this.loadedSources.length > 0 &&
        helpers.versionCompare(
          this.sourcesVersion,
          this.storedSourcesVersion
        ) === 0
      ) {
        return this.loadedSources;
      }

      let sources = [];

      await fetch("/src/json/se_sources.json")
        .then((res) => res.json())
        .then((data) => {
          sources = sources.concat(data);
        });

      await fetch("/src/json/se_third_party_sources.json")
        .then((res) => res.json())
        .then((data) => {
          sources = sources.concat(data);
        });

      await fetch("/src/json/se_community_sources.json")
        .then((res) => res.json())
        .then((data) => {
          sources = sources.concat(data);
        });

      this.loadedSources = sources.map((source) => {
        source.enabled = !!source.default;
        return source;
      });

      return this.loadedSources;
    },

    async fetchMonsters() {
      if (
        this.loadedMonsters.length > 0 &&
        helpers.versionCompare(
          this.storedSourcesVersion,
          this.sourcesVersion
        ) === 0
      ) {
        return this.loadedMonsters;
      }

      let monsters = [];

      await fetch("/src/json/se_monsters.json")
        .then((res) => res.json())
        .then((data) => {
          monsters = monsters.concat(data);
        });

      await fetch("/src/json/se_third_party_monsters.json")
        .then((res) => res.json())
        .then((data) => {
          monsters = monsters.concat(data);
        });

      await fetch("/src/json/se_community_monsters.json")
        .then((res) => res.json())
        .then((data) => {
          monsters = monsters.concat(data);
        });

      this.loadedMonsters = monsters;

      this.storedSourcesVersion = this.sourcesVersion;

      return this.loadedMonsters;
    },

    formatSources(data) {
      this.sources = data.reduce((acc, source) => {
        acc[source.name] = source;
        return acc;
      }, {});
    },

    formatMonsters(data) {
      this.allMonsters = data.map((data) => {
        const monster = new Monster(this, data);
        this.monsterLookupTable[monster.slug] = monster;
        return monster;
      });
      this.environments = Object.values(this.environments);
      this.environments.sort((a, b) => {
        return a.value > b.label ? -1 : 1;
      });
      this.environments.unshift({ value: "any", label: "Any Environment" });
      window.dispatchEvent(
        new CustomEvent("set-environments", { detail: this.environments })
      );
    },

    filterMonsters(
      crString = false,
      filterCallback = () => {
        return true;
      }
    ) {
      const monsters = this.allMonsters.filter((monster) => {
        return (
          monster.sourceEnabled &&
          filterCallback(monster) &&
          monster.filter(this.search, this.filters, crString)
        );
      });
      monsters.sort((a, b) => {
        if (this.sortBy === "cr") {
          return this.sortByDesc
            ? a[this.sortBy].numeric - b[this.sortBy].numeric
            : b[this.sortBy].numeric - a[this.sortBy].numeric;
        } else if (this.sortBy === "alignment") {
          return this.sortByDesc
            ? a[this.sortBy].bits - b[this.sortBy].bits
            : b[this.sortBy].bits - a[this.sortBy].bits;
        }
        return this.sortByDesc
          ? a[this.sortBy] > b[this.sortBy]
            ? 1
            : -1
          : a[this.sortBy] < b[this.sortBy]
          ? 1
          : -1;
      });
      return monsters;
    },

    filtersChanged($event) {
      const { name, value, asArray } = $event.detail;
      this.filters[name] = asArray ? Object.values(value) : value;
      this.nonDefaultFiltersCount = Object.entries(this.filters).filter(
        (entry) => {
          const [name, filter] = entry;
          switch (name) {
            case "cr":
              return filter.min !== 0 || filter.max !== 30;
            case "alignment":
              return filter !== CONST.ALL_ALIGNMENTS;
            default:
              return filter.length && !filter.includes("any");
          }
        }
      ).length;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.updateFilteredMonsters();
      }, 150);
    },

    updateFilteredMonsters() {
      this.filteredMonsters = this.filterMonsters();
      this.updatePagination();
    },

    resetFilters() {
      this.search = "";
    },

    formatNumber(num) {
      if (!num) return 0;
      return internationalNumberFormat.format(num);
    },

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
            case "ctrl+[":
              this.setPageNumber(this.currentPage - 1);
              return false;
            case "ctrl+]":
              this.setPageNumber(this.currentPage + 1);
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

    sendToImprovedInitiative() {
      const data = {
        Combatants: [],
      };

      this.encounter.groups.forEach((group) => {
        const monster = group.monster;
        for (let i = 0; i < group.count; i++) {
          data.Combatants.push({
            Name: monster.name,
            HP: { Value: monster.data.hp },
            InitiativeModifier: monster.data.init,
            AC: { Value: monster.data.ac },
            Player: "npc",
          });
        }
      });

      this.savedParties.forEach((party, partyIndex) => {
        party.players
          .filter((player) => player.active)
          .forEach((player, playerIndex) => {
            data.Combatants.push({
              Id: helpers.slugify(`${party.name}-${player.name}`),
              Name: player.name,
              InitiativeModifier: player.initiativeMod,
              InitiativeAdvantage: player.initiativeAdvantage,
              HP: { Value: player.currentHp, Max: player.maxHp },
              Player: "player",
            });
          });
      });

      const form = document.createElement("form");
      form.style.display = "none";
      form.setAttribute("target", "_blank");
      form.setAttribute("method", "POST");
      form.setAttribute(
        "action",
        "https://www.improved-initiative.com/launchencounter/"
      );

      Object.entries(data).forEach((entry) => {
        const [key, value] = entry;
        const textarea = document.createElement("input");
        textarea.setAttribute("type", "hidden");
        textarea.setAttribute("name", key);
        textarea.setAttribute("value", JSON.stringify(value));
        form.appendChild(textarea);
      });

      document.body.appendChild(form);
      form.submit();
    },
  },

  created() {
    this.setupHotkeys();
    this.encounter.app = this;
    this.party.app = this;
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

    this.$watch("sources", () => {
      this.enabledSources = Object.values(this.sources).filter(
        (source) => source.enabled
      );
    });
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
<!--     <span v-text="monsterStore.filtered.map((entry) => entry.name)"></span>-->

<!--      <label-->
<!--        for="search"-->
<!--        class="max-w-full block text-sm font-medium text-gray-700 sr-only"-->
<!--        >Search monsters</label-->
<!--      >-->

<!--      <div class="px-4 sm:px-6 lg:px-8">-->
<!--        <div-->
<!--          class="max-w-full mt-1 flex flex-col lg:flex-row rounded-md shadow-sm"-->
<!--        >-->
<!--          <div class="relative items-stretch grow focus-within:z-10">-->
<!--            <div-->
<!--              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"-->
<!--            >-->
<!--              <svg-->
<!--                xmlns="http://www.w3.org/2000/svg"-->
<!--                class="h-5 w-5 text-gray-400"-->
<!--                fill="none"-->
<!--                viewBox="0 0 24 24"-->
<!--                stroke="currentColor"-->
<!--                stroke-width="2"-->
<!--              >-->
<!--                <path-->
<!--                  stroke-linecap="round"-->
<!--                  stroke-linejoin="round"-->
<!--                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"-->
<!--                />-->
<!--              </svg>-->
<!--            </div>-->

<!--            <input-->
<!--              type="search"-->
<!--              name="search"-->
<!--              id="search"-->
<!--              v-model="search"-->
<!--              @input.debounce="updateFilteredMonsters"-->
<!--              class="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-md lg:rounded-r-none pl-10 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600"-->
<!--              :placeholder="searchPlaceholder"-->
<!--            />-->

<!--            <div-->
<!--              class="absolute inset-y-0 right-0 flex py-1.5 pr-2 hidden md:block"-->
<!--            >-->
<!--              <kbd-->
<!--                class="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-sm font-sans font-medium text-gray-400"-->
<!--                v-text="keyboardText"-->
<!--              ></kbd>-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="flex w-full lg:w-auto mt-2 lg:mt-0">-->
<!--            <div class="w-full lg:w-auto">-->
<!--              <select-->
<!--                id="monstersPerPage"-->
<!--                @change="setMonstersPerPage(Number($event.target.value))"-->
<!--                name="location"-->
<!--                class="block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-l-md lg:rounded-none 2xl:rounded-r-md border-gray-300 border-l-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600"-->
<!--              >-->
<!--                <option value="10" :selected="monstersPerPage === 10">-->
<!--                  10 per page-->
<!--                </option>-->
<!--                <option value="25" :selected="monstersPerPage === 25">-->
<!--                  25 per page-->
<!--                </option>-->
<!--                <option value="50" :selected="monstersPerPage === 50">-->
<!--                  50 per page-->
<!--                </option>-->
<!--                <option value="100" :selected="monstersPerPage === 100">-->
<!--                  100 per page-->
<!--                </option>-->
<!--              </select>-->
<!--            </div>-->

<!--            <div-->
<!--              class="relative inline-block text-left 2xl:hidden"-->
<!--              x-data="{ filtersMenu: true }"-->
<!--              title="Filter monsters (Ctrl+L)"-->
<!--            >-->
<!--              <button-->
<!--                @click="showFilters = !showFilters"-->
<!--                type="button"-->
<!--                class="-ml-px h-full relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md bg-white disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-gray-400 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"-->
<!--              >-->
<!--                <svg-->
<!--                  xmlns="http://www.w3.org/2000/svg"-->
<!--                  class="h-5 w-5 text-gray-400"-->
<!--                  fill="none"-->
<!--                  viewBox="0 0 24 24"-->
<!--                  stroke="currentColor"-->
<!--                  stroke-width="2"-->
<!--                >-->
<!--                  <path-->
<!--                    stroke-linecap="round"-->
<!--                    stroke-linejoin="round"-->
<!--                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"-->
<!--                  />-->
<!--                </svg>-->
<!--                <span>Filter</span>-->
<!--                <span-->
<!--                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-300 text-gray-800"-->
<!--                  v-show="nonDefaultFiltersCount > 0"-->
<!--                  v-text="nonDefaultFiltersCount"-->
<!--                ></span>-->
<!--              </button>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->

<!--      &lt;!&ndash; This example requires Tailwind CSS v2.0+ &ndash;&gt;-->
      <MonsterTable @modal="$emit('modal', $event)"></MonsterTable>
    </div>

    <div
      id="encounter_box"
      :class="{ 'hidden md:flex': mobileEncounterTab }"
      class="hidden md:absolute md:inset-y-0 md:py-8 md:left-4 md:pr-4 md:pl-4 pb-8 md:flex w-full px-8 2xl:pr-4 flex-col flex-shrink-0 md:w-[28rem] overflow-y-auto scrollbar"
    >
      <div class="grid grid-cols-3 md:pr-2 md:grid-cols-5 pb-4 flex-col w-full">
        <div class="col-span-3 space-y-2">
          <div class="flex justify-between items-end">
            <div class="mb-1 text-gray-600 dark:text-gray-400">Party</div>

            <a
              class="primary-link text-sm"
              @click="$emit('modal', { name: 'Party' })"
              href="javascript:"
            >
              Manage
            </a>
          </div>

          <div
            class="grid grid-cols-[1fr_34px] gap-y-2 align-center mb-2"
            v-show="activePlayers.length"
          >
            <div v-for="party in savedParties">
              <div
                v-for="player in party.players.filter(
                  (player) => player.active
                )"
              >
                <div class="contents">
                  <div v-text="player.name"></div>

                  <button
                    @click="player.active = false"
                    type="button"
                    class="button-danger-outline-md inline-flex justify-center !py-0"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-show="party.groups.length"
            class="w-full grid grid-rows-[18px_1fr] grid-cols-[1fr_40px_1fr_50px_36px] gap-y-2 align-center mb-2"
          >
            <label class="col-span-2 text-sm text-gray-700 dark:text-gray-300"
              >Players</label
            >
            <label class="text-sm text-gray-700 dark:text-gray-300"
              >Level</label
            >
            <label
              class="text-center text-sm text-gray-700 dark:text-gray-300"
              title="Determines whether these characters get a share of XP from the encounter."
              >XP</label
            >
            <div>&nbsp;</div>

            <div v-for="(group, index) in party.groups">
              <div class="contents">
                <input
                  type="number"
                  min="1"
                  :value="group.players"
                  @change="group.players = Math.max(1, $event.target.value)"
                  class="border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5 pr-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"
                  value="4"
                />

                <div
                  class="text-center grid place-items-center text-gray-600 dark:text-gray-400 scale-150 md:transform-none"
                >
                  <i class="fa fa-times"></i>
                </div>

                <input
                  type="number"
                  min="1"
                  max="20"
                  :value="group.level"
                  @change="
                    group.level = Math.max(1, Math.min(20, $event.target.value))
                  "
                  class="border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5 pr-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"
                  value="4"
                />

                <div
                  class="flex items-center justify-center scale-150 md:transform-none"
                >
                  <input
                    type="checkbox"
                    v-model="group.getsXP"
                    class="focus:ring-emerald-500 h-4 w-4 text-emerald-600 disabled:opacity-70 border-gray-300 rounded"
                  />
                </div>

                <button
                  @click="party.removePlayerGroup(index)"
                  type="button"
                  class="button-danger-outline-md justify-center"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="w-full">
            <button
              @click="party.addPlayerGroup()"
              type="button"
              class="button-primary-outline-md align-self-start w-full md:mt-4 md:mt-auto flex justify-center"
            >
              <span> <i class="fas fa-plus mr-2"></i> Add Generic Group </span>
            </button>
          </div>

          <div
            class="w-full"
            v-show="!(activePlayers.length || party.groups.length)"
          >
            <button
              @click="enablePartyModal"
              type="button"
              class="button-primary-outline-md align-self-start w-full md:mt-4 md:mt-auto flex justify-center"
            >
              <span> <i class="fas fa-plus mr-2"></i> Use Detailed Party </span>
            </button>
          </div>
        </div>

        <div class="hidden md:block col-span-2">
          <div class="grid text-sm text-right">
            <div
              class="hidden md:block mb-1 col-span-2 text-gray-600 text-base dark:text-gray-400"
            >
              XP Goals
            </div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Easy',
              }"
            >
              Easy
            </div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Easy',
              }"
              v-text="formatNumber(party.experience['easy'])"
            ></div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Medium',
              }"
            >
              Medium
            </div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Medium',
              }"
              v-text="formatNumber(party.experience['medium'])"
            ></div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Hard',
              }"
            >
              Hard
            </div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Hard',
              }"
              v-text="formatNumber(party.experience['hard'])"
            ></div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Deadly',
              }"
            >
              Deadly
            </div>
            <div
              :class="{
                'font-semibold': encounter.actualDifficulty === 'Deadly',
              }"
              v-text="formatNumber(party.experience['deadly'])"
            ></div>

            <div class="mt-4">Daily budget</div>
            <div
              class="mt-4"
              v-text="formatNumber(party.experience.daily)"
            ></div>
          </div>
        </div>

        <div class="md:hidden col-span-3 pt-4" v-show="party.experience.daily">
          <div
            class="mb-1 col-span-2 text-gray-600 text-base dark:text-gray-400"
          >
            XP Goal
          </div>
          <div class="flex justify-between">
            <div>
              Daily budget
              <span v-text="formatNumber(party.experience.daily)"></span>
            </div>
            <div>
              <span
                class="font-semibold"
                v-show="
                  ['Easy', 'Medium', 'Hard', 'Deadly'].includes(
                    encounter.actualDifficulty
                  )
                "
                v-text="
                  encounter.actualDifficulty +
                  ' ' +
                  formatNumber(
                    party.experience[encounter.actualDifficulty.toLowerCase()]
                  )
                "
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700">
        <div class="flex pt-4 justify-between items-center mb-1">
          <span class="text-gray-600 dark:text-gray-400">Encounter</span>

          <a
            href="javascript:"
            class="primary-link text-sm"
            @click="$emit('modal', { name: 'Encounter' })"
            >History</a
          >
        </div>

        <div
          class="flex flex-col sm:flex-row pb-4 w-full space-x-2 items-end justify-between pb-4"
        >
          <div class="grid gap-2 w-full place-items-end sm:grid-cols-8 grow">
            <div class="w-full col-span-1 sm:col-span-3">
              <label id="difficulty-label" class="sr-only"> Difficulty </label>
              <div
                class="mt-1 relative"
                @click.outside="difficultySelectOpen = false"
              >
                <button
                  @click="difficultySelectOpen = true"
                  type="button"
                  class="bg-white dark:bg-gray-700 relative w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  aria-haspopup="listbox"
                  aria-expanded="true"
                  aria-labelledby="listbox-label"
                >
                  <span
                    class="block truncate"
                    v-text="
                      difficulty.slice(0, 1).toUpperCase() + difficulty.slice(1)
                    "
                  ></span>
                  <span
                    class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                  >
                    <svg
                      class="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                </button>

                <ul
                  v-show="difficultySelectOpen"
                  class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  tabindex="-1"
                  role="listbox"
                  aria-labelledby="listbox-label"
                  x-transition:enter=""
                  x-transition:enter-start=""
                  x-transition:enter-end=""
                  x-transition:leave="transition ease-in duration-100"
                  x-transition:leave-start="opacity-100"
                  x-transition:leave-end="opacity-0"
                >
                  <li
                    v-for="option of ['easy', 'medium', 'hard', 'deadly']"
                    @click="
                      difficulty = option;
                      difficultySelectOpen = false;
                    "
                    :class="{
                      'text-white bg-emerald-600': difficulty === option,
                      'text-gray-900 dark:text-gray-300': difficulty !== option,
                    }"
                    class="group text-gray-900 hover:text-white hover:bg-emerald-600 cursor-default select-none relative py-2 pl-3 pr-9"
                    role="option"
                  >
                    <span
                      class="group-hover:text-white font-normal block truncate"
                      v-html="
                        option.slice(0, 1).toUpperCase() + option.slice(1)
                      "
                    >
                    </span>
                    <span
                      :class="{
                        'text-gray-200': difficulty === option,
                        'text-gray-600 dark:text-gray-400':
                          difficulty !== option,
                      }"
                      class="text-xs group-hover:text-gray-200"
                      v-text="formatNumber(party.experience[option]) + 'xp'"
                    ></span>

                    <span
                      v-show="difficulty === option"
                      :class="{
                        'text-white': difficulty === option,
                        'text-emerald-600': difficulty !== option,
                      }"
                      class="absolute inset-y-0 right-0 flex items-center pr-4"
                    >
                      <svg
                        class="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="w-full col-span-1 sm:col-span-5">
              <label id="composition-label" class="sr-only">
                Composition
              </label>
              <div
                class="mt-1 relative"
                @click.outside="encounterTypeSelectOpen = false"
              >
                <button
                  @click="encounterTypeSelectOpen = true"
                  type="button"
                  class="bg-white dark:bg-gray-700 relative w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  aria-haspopup="listbox"
                  aria-expanded="true"
                  aria-labelledby="composition-label"
                >
                  <span
                    class="block truncate"
                    v-text="encounterTypes[encounterType].label"
                  ></span>
                  <span
                    class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                  >
                    <svg
                      class="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                </button>

                <ul
                  v-show="encounterTypeSelectOpen"
                  class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  tabindex="-1"
                  role="listbox"
                  aria-labelledby="composition-label"
                  x-transition:enter=""
                  x-transition:enter-start=""
                  x-transition:enter-end=""
                  x-transition:leave="transition ease-in duration-100"
                  x-transition:leave-start="opacity-100"
                  x-transition:leave-end="opacity-0"
                >
                  <li
                    v-for="type of Object.values(encounterTypes)"
                    @click="
                      encounterType = type.key;
                      encounterTypeSelectOpen = false;
                    "
                    :class="{
                      'text-white bg-emerald-600': encounterType === type.key,
                      'text-gray-900 dark:text-gray-300':
                        encounterType !== type.key,
                    }"
                    class="text-gray-900 hover:text-white hover:bg-emerald-600 cursor-default select-none relative py-2 pl-3 pr-9"
                    role="option"
                  >
                    <span
                      class="font-normal block truncate"
                      v-text="type.label"
                    >
                    </span>

                    <span
                      :class="{
                        'text-white': encounterType === type.key,
                        'text-emerald-600': encounterType !== type.key,
                      }"
                      class="absolute inset-y-0 right-0 flex items-center pr-4"
                    >
                      <svg
                        v-show="encounterType === type.key"
                        class="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div
            class="w-full md:w-auto shrink mt-3 md:mt-0"
            :class="{ 'hidden md:block': !encounter.groups.length }"
          >
            <button
              @click="encounter.generateRandom()"
              class="button-primary-md w-full md:w-auto"
            >
              <span class="md:hidden w-full text-center"> Generate </span>
              <span class="hidden md:inline">
                <i class="fa fa-refresh"></i>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        class="border-t border-gray-200 dark:border-gray-700 pt-4"
        v-show="encounter.groups.length"
      >
        <div
          v-for="(group, index) in encounter.groups"
          :key="group.monster.slug"
        >
          <div class="flex flex-row w-full mb-4 relative">
            <div class="grow pb-2 min-w-0">
              <div class="grid grid-cols-[1fr_20px] mb-2">
                <span
                  :title="group.monster.name"
                  data-tippy-placement="top-start"
                  data-tippy-delay="1000"
                  class="text-lg pr-3 font-semibold max-w-full overflow-ellipsis truncate"
                  v-text="group.monster.name"
                ></span>
                <div
                  title="Shuffle monster"
                  @click="encounter.getNewMonster(group)"
                  class="grid place-items-center text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 cursor-pointer"
                >
                  <i class="fas fa-random"></i>
                </div>
              </div>

              <div>
                <span
                  class="text-base"
                  v-text="'CR: ' + group.monster.cr.string"
                ></span>
                <span
                  class="text-base ml-4"
                  v-text="'XP: ' + formatNumber(group.monster.cr.exp)"
                ></span>
                <div
                  class="overflow-hidden whitespace-nowrap overflow-ellipsis pr-40"
                >
                  <ul class="list-none text-s italic max-w-full">
                    <li
                      v-for="source in group.monster.sources"
                      class="max-w-full truncate"
                      :title="source.fullText"
                      data-tippy-delay="1000"
                      v-html="
                        source.reference.link
                          ? `<a class='primary-link' href='${source.reference.link}' target='_blank'>${source.fullText}</a>`
                          : source.fullText
                      "
                    ></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="absolute bottom-3 right-0 flex shrink-0 items-center">
              <div class="flex rounded-md shadow-sm">
                <button
                  @click="encounter.addCount(index)"
                  class="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 sm:text-sm"
                >
                  <i class="fa fa-plus w-5"></i>
                </button>
                <label for="monster-number"></label>
                <input
                  id="monster-number"
                  type="number"
                  min="1"
                  class="flex-1 min-w-0 block w-16 px-3 py-2 rounded-none dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300"
                  :value="group.count"
                  @change="group.count = Math.max(0, $event.target.value)"
                />
                <button
                  @click="encounter.subtractCount(index)"
                  :class="{
                    'border-gray-300 dark:border-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500':
                      group.count > 1,
                    'border-red-200 dark:border-red-700 dark:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:hover:bg-red-700 text-red-500':
                      group.count === 1,
                  }"
                  class="inline-flex items-center px-2 rounded-r-md border border-l-0 sm:text-sm"
                >
                  <i
                    :class="{
                      'fa-minus': group.count > 1,
                      'fa-times': group.count === 1,
                    }"
                    class="fa w-5"
                  ></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-show="encounter.groups.length" class="-mt-2 text-center pb-4">
          <a
            @click="encounter.clear()"
            class="select-none text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            href="javascript:"
            ><i class="fa fa-times"></i> Clear encounter</a
          >
        </div>
      </div>

      <div v-show="!encounter.groups.length" class="pb-4">
        <button
          @click="encounter.generateRandom()"
          type="button"
          class="relative block w-full border-2 border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 border-dashed rounded-lg p-6 md:p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <i
            class="fa-solid fa-wand-sparkles text-2xl h-12 w-12 mx-auto text-gray-400 dark:text-gray-300"
          ></i>
          <span
            class="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200"
          >
            Generate an encounter
          </span>
        </button>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-700">
        <dl
          class="space-y-1 divide-y divide-dashed divide-gray-400 dark:divide-gray-700"
        >
          <div class="flex items-center justify-between">
            <dt class="mt-1 text-sm text-gray-600 dark:text-gray-200">
              <span class="block">Difficulty</span>
            </dt>
            <dd
              class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300 text-right"
            >
              <span class="block" v-text="encounter.actualDifficulty"></span>
              <span
                class="block text-gray-500 dark:text-gray-400 text-sm"
                v-show="
                  encounter.difficultyFeel &&
                  encounter.actualDifficulty.toLowerCase() !==
                    encounter.difficultyFeel.toLowerCase()
                "
                v-text="'Feels ' + encounter.difficultyFeel"
              ></span>
            </dd>
          </div>

          <div class="flex items-center justify-between">
            <dt class="mt-1 text-sm text-gray-600 dark:text-gray-200">
              Total XP
            </dt>
            <dd
              class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300"
              v-text="
                encounter.totalExp > 0
                  ? formatNumber(encounter.totalExp) +
                    ' (' +
                    formatNumber(
                      Math.round(
                        encounter.totalExp / party.totalPlayersToGainXP
                      )
                    ) +
                    '/player)'
                  : 'N/A'
              "
            ></dd>
          </div>

          <div class="flex items-center justify-between">
            <dt class="mt-1 text-sm text-gray-600 dark:text-gray-200">
              Adjusted XP
            </dt>
            <dd
              class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300"
              v-text="
                encounter.adjustedExp > 0
                  ? formatNumber(encounter.adjustedExp) +
                    ' (' +
                    formatNumber(
                      Math.round(
                        encounter.adjustedExp / party.totalPlayersToGainXP
                      )
                    ) +
                    '/player)'
                  : 'N/A'
              "
            ></dd>
          </div>
        </dl>

        <div class="mt-4 flex space-x-2">
          <button
            :disabled="!encounter.groups.length"
            class="grow text-center button-primary-md"
            @click="sendToImprovedInitiative"
          >
            <span class="inline-flex justify-center w-full">
              <img
                class="mr-2 fill-white"
                style="height: 20px"
                src="/src/assets/images/improved-initiative-logo.svg"
                alt="II"
              />
              Send to Improved Initiative
            </span>
          </button>

          <button
            :disabled="!encounter.groups.length"
            class="button-primary-md shrink-0"
            @click="encounter.save()"
          >
            <i class="fa fa-save"></i>
          </button>
        </div>
      </div>
    </div>

    <FiltersSlideover :show-filters="showFilters" @close="showFilters = false" />
  </div>
</template>

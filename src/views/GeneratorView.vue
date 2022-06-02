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
import SearchBox from "../components/SearchBox.vue";
import PartyPanel from "../components/PartyPanel.vue";

import {useEncounter} from "../stores/encounter";
import {useParty} from "../stores/party";

export default {
  components: { SearchBox, FiltersSlideover, MonsterTable, PartyPanel },
  emits: ["modal"],

  setup() {
    const encounter = useEncounter();
    const party = useParty();

    return {
      encounter,
      party,
    }
  },

  data() {
    return {
      sourcesVersion: "2.1.0",
      storedSourcesVersion: "2.0.0",

      showFilters: false,

      mobileEncounterTab: false,

      encounterTypeSelectOpen: false,
      encounterTypes: Object.fromEntries(
        Object.entries(CONST.ENCOUNTER_TYPES).map((entry) => {
          return [entry[0], { key: entry[0], label: entry[1].name }];
        })
      ),
      encounterType: "random",

      difficultySelectOpen: false,
      difficulty: "medium",

      timer: null,
    };
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

    enablePartyModal() {
      this.showPartyModal = true;

      if (this.party.saved.length === 1) {
        this.party.saved[0].editing = true;
      }
    },

    createParty() {
      this.party.saved.forEach((party) => (party.editing = false));
      this.party.saved.push({
        name: "Party " + (this.party.saved.length + 1),
        editing: true,
        players: [],
      });
      this.createPlayer(this.party.saved.length - 1);
    },

    activateParty(partyIndex) {
      this.party.saved[partyIndex].players.forEach(
        (player) => (player.active = true)
      );
    },

    deactivateParty(partyIndex) {
      this.party.saved[partyIndex].players.forEach(
        (player) => (player.active = false)
      );
    },

    deleteParty(partyIndex) {
      this.party.saved.splice(partyIndex, 1);
    },

    createPlayer(partyIndex) {
      this.party.saved[partyIndex].players.push({
        name: "Player " + (this.party.saved[partyIndex].players.length + 1),
        initiativeMod: 0,
        initiativeAdvantage: false,
        level:
          this.party.saved[partyIndex].players[
            this.party.saved[partyIndex].players.length - 1
          ]?.level ?? 1,
        maxHp:
          this.party.saved[partyIndex].players[
            this.party.saved[partyIndex].players.length - 1
          ]?.maxHp ?? 10,
        currentHp:
          this.party.saved[partyIndex].players[
            this.party.saved[partyIndex].players.length - 1
          ]?.currentHp ?? 10,
        active: false,
        partyIndex: 0,
      });
    },

    deletePlayer(partyIndex, playerIndex) {
      this.party.saved[partyIndex].players.splice(playerIndex, 1);
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

    formatNumber(number) {
      return helpers.formatNumber(number);
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

      this.party.saved.forEach((party, partyIndex) => {
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
      <SearchBox @toggle-filters="showFilters = !showFilters" />
      <MonsterTable @modal="$emit('modal', $event)"></MonsterTable>
    </div>

    <div
      id="encounter_box"
      :class="{ 'hidden md:flex': mobileEncounterTab }"
      class="hidden md:absolute md:inset-y-0 md:py-8 md:left-4 md:pr-4 md:pl-4 pb-8 md:flex w-full px-8 2xl:pr-4 flex-col flex-shrink-0 md:w-[28rem] overflow-y-auto scrollbar"
    >
      <PartyPanel></PartyPanel>

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

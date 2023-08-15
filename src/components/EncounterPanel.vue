<script setup>
import SelectInput from "./SelectInput.vue";
import EncounterMonster from "./EncounterMonster.vue";
import EmptyStateButton from "./EmptyStateButton.vue";
import ImprovedInitiativeButton from "./ImprovedInitiativeButton.vue";

import * as helpers from "../js/helpers";
import { useEncounter } from "../stores/encounter";
import { useParty } from "../stores/party";
import CONST from "../js/constants";
import { useModals } from "../stores/modals";

const encounter = useEncounter();
const party = useParty();
const modals = useModals();
</script>

<template>
  <div>
    <div class="border-t border-gray-200 dark:border-gray-700">
      <div class="flex pt-4 justify-between items-center mb-1">
        <span class="text-gray-600 dark:text-gray-400">Encounter</span>

        <a
          href="javascript:"
          class="primary-link text-sm"
          @click="modals.show('encounter')"
          >History</a
        >
      </div>

      <div
        class="flex flex-col sm:flex-row pb-4 w-full space-x-2 items-end justify-between pb-4"
      >
        <div class="grid gap-2 w-full place-items-end sm:grid-cols-8 grow">
          <div class="w-full col-span-1 sm:col-span-3">
            <label id="difficulty-label" class="sr-only"> Difficulty </label>
            <SelectInput
              v-model="encounter.difficulty"
              :label="
                encounter.difficulty.slice(0, 1).toUpperCase() +
                encounter.difficulty.slice(1)
              "
              :options="
                ['easy', 'medium', 'hard', 'deadly'].map((option) => {
                  return {
                    key: option,
                    label: option.slice(0, 1).toUpperCase() + option.slice(1),
                  };
                })
              "
              :option-subtext="
                (option) =>
                  helpers.formatNumber(party.experience[option.key]) + 'xp'
              "
            ></SelectInput>
          </div>

          <div class="w-full col-span-1 sm:col-span-5">
            <SelectInput
              v-model="encounter.type"
              :label="CONST.ENCOUNTER_TYPES[encounter.type].name"
              :options="
                Object.entries(CONST.ENCOUNTER_TYPES).map((entry) => {
                  return { key: entry[0], label: entry[1].name };
                })
              "
            ></SelectInput>
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

        <div
          class="w-full md:w-auto shrink mt-3 md:mt-0"
        >
          <button
            @click="modals.show('strategy')"
            class="button-primary-md w-full md:w-auto"
          >
            <span class="inline">
              <i class="fa fa-cog"></i>
            </span>
          </button>
        </div>
      </div>
    </div>

    <div
      class="border-t border-gray-200 dark:border-gray-700 pt-4"
      v-show="encounter.groups.length"
    >
      <EncounterMonster
        v-for="(group, index) in encounter.groups"
        :key="group.monster.slug"
        :group="group"
        @shuffle="encounter.getNewMonster(group)"
        @add="encounter.addCount(index)"
        @subtract="encounter.subtractCount(index)"
        @count="group.count = $event"
      ></EncounterMonster>

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
      <EmptyStateButton
        @click="encounter.generateRandom()"
        icon="fa-solid fa-wand-sparkles"
      >
        Generate an encounter
      </EmptyStateButton>
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
                ? helpers.formatNumber(encounter.totalExp) +
                  ' (' +
                  helpers.formatNumber(
                    Math.round(encounter.totalExp / party.totalPlayersToGainXP)
                  ) +
                  '/player)'
                : 'N/A'
            "
          ></dd>
        </div>

        <div class="flex items-center justify-between" v-show="encounter.adjustedExp > 0">
          <dt class="mt-1 text-sm text-gray-600 dark:text-gray-200">
            Adjusted XP
          </dt>
          <dd
            class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300"
            v-text="
              encounter.adjustedExp > 0
                ? helpers.formatNumber(encounter.adjustedExp) +
                  ' (' +
                  helpers.formatNumber(
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
        <ImprovedInitiativeButton>
          Send to Improved Initiative
        </ImprovedInitiativeButton>

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
</template>

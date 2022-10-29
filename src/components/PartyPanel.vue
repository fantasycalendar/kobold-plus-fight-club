<script setup>
import { useParty } from "../stores/party";
import { useEncounter } from "../stores/encounter";
import { useModals } from "../stores/modals";

import { formatNumber, capitalizeFirstLetter } from "../js/helpers.js";

const party = useParty();
const encounter = useEncounter();
const modals = useModals();
</script>

<template>
  <div class="grid grid-cols-3 md:pr-2 md:grid-cols-5 pb-4 flex-col w-full">
    <div class="col-span-3 space-y-2">
      <div class="flex justify-between items-end">
        <div class="mb-1 text-gray-600 dark:text-gray-400">Party</div>

        <a
          class="primary-link text-sm"
          @click="modals.show('party')"
          href="javascript:"
        >
          Manage
        </a>
      </div>

      <div
        class="grid grid-cols-[1fr_34px] gap-y-2 align-center mb-2"
        v-show="party.activePlayers.length"
      >
        <div v-for="party in party.saved" :key="party.name" class="contents">
          <div
            class="contents"
            v-for="player in party.players.filter((player) => player.active)"
            :key="player.name"
          >
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

      <div
        v-show="party.groups.length"
        class="w-full grid grid-rows-[18px_1fr] grid-cols-[1fr_40px_1fr_50px_36px] gap-y-2 align-center mb-2"
      >
        <label class="col-span-2 text-sm text-gray-700 dark:text-gray-300"
          >Players</label
        >
        <label class="text-sm text-gray-700 dark:text-gray-300">Level</label>
        <label
          class="text-center text-sm text-gray-700 dark:text-gray-300"
          title="Determines whether these characters get a share of XP from the encounter."
          >XP</label
        >
        <div>&nbsp;</div>

        <div class="contents" v-for="(group, index) in party.groups">
          <input
            type="number"
            min="1"
            :value="group.players"
            @change="group.players = Math.max(1, $event.target.value)"
            class="border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5 pr-0 sm:text-sm disabled:text-gray-500 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"
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
            @click="party.removeGroup(index)"
            type="button"
            class="button-danger-outline-md justify-center"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="w-full">
        <button
          @click="party.addGroup()"
          type="button"
          class="button-primary-outline-md align-self-start w-full md:mt-4 md:mt-auto flex justify-center"
        >
          <span> <i class="fas fa-plus mr-2"></i> Add Generic Group </span>
        </button>
      </div>

      <div
        class="w-full"
        v-show="!(party.activePlayers.length || party.groups.length)"
      >
        <button
          @click="modals.show('party')"
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
          v-for="difficulty in Object.keys(party.power)"
          :key="difficulty"
          class="contents"
          :class="{
            'font-semibold': encounter.actualDifficulty === difficulty,
          }"
        >
          <span>{{ capitalizeFirstLetter(difficulty) }}</span>
          <span>{{
            formatNumber(party.power[difficulty])
          }}</span>
        </div>

        <div class="mt-4">Daily budget</div>
        <div class="mt-4" v-text="formatNumber(party.experience.daily)"></div>
      </div>
    </div>

    <div class="md:hidden col-span-3 pt-4" v-show="party.experience.daily">
      <div class="mb-1 col-span-2 text-gray-600 text-base dark:text-gray-400">
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
</template>

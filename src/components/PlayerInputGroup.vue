<script setup>
import ToggleInput from "./ToggleInput.vue";
import { useParty } from "../stores/party";

const parties = useParty();

defineProps({
  player: Object,
  playerIndex: Number,
  partyIndex: Number,
  editing: Boolean,
});
</script>

<template>
  <div
    class="grid gap-2 grid-cols-[1fr_1fr_60px] md:grid-cols-[1fr_50px_75px_150px_60px]"
  >
    <div class="order-1">
      <input
        type="text"
        :id="'name_' + playerIndex"
        v-model="player.name"
        class="px-1 py-1 !mb-0 block w-full sm:text-sm rounded-md dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
      />
    </div>
    <div class="order-2">
      <input
        type="number"
        :id="'level_' + playerIndex"
        v-model="player.level"
        class="px-1 py-1 block w-full sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
      />
    </div>

    <div class="relative order-4 md:order-3 mb-2 md:mb-0">
      <input
        type="number"
        :id="'initiativeMod_' + playerIndex"
        v-model="player.initiativeMod"
        class="pl-1 pr-8 py-1 block w-full sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
      />
      <div
        :class="{
          'text-emerald-600 hover:text-emerald-700 dark:text-emerald-600 dark:hover:text-emerald-700':
            player.initiativeAdvantage,
          'text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400':
            !player.initiativeAdvantage,
        }"
        class="text-2xl text-center w-6 cursor-pointer select-none absolute inset-y-0 right-1 flex justify-center items-center"
        @click="player.initiativeAdvantage = !player.initiativeAdvantage"
        title="Advantage on Initiative"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6"
          style="fill: currentColor"
          viewBox="0 0 75 75"
        >
          <path
            stroke="none"
            d="M33 1.3094010767585a8 8 0 0 1 8 0l24.908965343809 14.381197846483a8 8 0 0 1 4 6.9282032302755l0 28.762395692966a8 8 0 0 1 -4 6.9282032302755l-24.908965343809 14.381197846483a8 8 0 0 1 -8 0l-24.908965343809 -14.381197846483a8 8 0 0 1 -4 -6.9282032302755l0 -28.762395692966a8 8 0 0 1 4 -6.9282032302755"
          ></path>
        </svg>
      </div>
      <div
        class="pointer-events-none text-lg text-center text-white dark:text-gray-700 font-bold w-6 cursor-pointer select-none absolute inset-y-0 right-1 flex justify-center items-center"
      >
        A
      </div>
    </div>

    <div
      class="order-5 md:order-4 justify-center md:justify-start flex -space-x-px mb-2 md:mb-0"
    >
      <div class="w-1/2 flex-1 min-w-0">
        <input
          min="0"
          @change="parties.playerChange(player)"
          @blur="parties.playerChange(player)"
          type="number"
          v-model="player.currentHp"
          class="px-1 py-1 text-right border-r-0 relative block w-full rounded-none rounded-l-md sm:text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
        />
      </div>
      <div
        class="grid place-items-center px-1 shrink rounded-none border border-y-1 bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
      >
        /
      </div>
      <div class="flex-1 min-w-0">
        <input
          min="1"
          type="number"
          v-model="player.maxHp"
          class="px-1 py-1 relative border-l-0 block w-full rounded-none rounded-r-md sm:text-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
        />
      </div>
    </div>

    <div
      class="order-4 md:order-6"
    ><button
        @click="$emit('delete')"
        v-if="editing"
        class="button-danger-outline-md self-stretch w-full flex justify-center items-center -mb-1"
      >
        <i
          class="fa fa-user-xmark text-red-500 dark:text-red-500 group-hover:text-red-600 dark:group-hover:text-red-700"
        ></i>
      </button>

      <ToggleInput
        class="pt-[2px]"
        v-if="!editing"
        v-model="player.active"
        end="true"
      ></ToggleInput>
    </div>
  </div>
</template>

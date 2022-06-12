<script setup>
import ToggleInput from "./ToggleInput.vue";
import { useParty } from "../stores/party";

const parties = useParty();

defineProps({
  player: Object,
  playerIndex: Number,
  partyIndex: Number,
});
</script>

<template>
  <div
    class="grid gap-2 grid-cols-[60px_1fr_1fr] md:grid-cols-[60px_1fr_50px_75px_150px_30px]"
  >
    <ToggleInput v-model="player.active"></ToggleInput>

    <div class="order-2">
      <input
        type="text"
        :id="'name_' + playerIndex"
        v-model="player.name"
        class="px-1 py-1 !mb-0 block w-full sm:text-sm rounded-md dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
      />
    </div>
    <div class="order-3">
      <input
        type="number"
        :id="'level_' + playerIndex"
        v-model="player.level"
        class="px-1 py-1 block w-full sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300"
      />
    </div>

    <div class="relative order-5 md:order-4 mb-2 md:mb-0">
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
          width="18.5"
          height="28"
          viewbox="0 0 173.20508075688772 200"
          style="fill: currentColor"
        >
          <path
            d="M86.60254037844386 0L173.20508075688772 50L173.20508075688772 150L86.60254037844386 200L0 150L0 50Z"
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
      class="order-6 md:order-5 justify-center md:justify-start flex -space-x-px mb-2 md:mb-0"
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
      @click="$emit('delete')"
      class="order-4 md:order-6 group cursor-pointer grid place-items-center mb-2 md:mb-0"
    >
      <i
        class="fa fa-times text-red-500 dark:text-red-500 group-hover:text-red-600 dark:group-hover:text-red-700"
      ></i>
    </div>
  </div>
</template>

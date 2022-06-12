<script setup>
import { useParty } from "../stores/party";
import {ref} from "vue";
import ToggleInput from "./ToggleInput.vue";

const parties = useParty();

const props = defineProps({
  party: Object,
  index: Number,
});

const editing = ref(false);
</script>

<template>
  <div
    class="flex px-4 py-4 dark:border-gray-700 w-100 relative cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600"
    :class="{
      'bg-gray-100 hover:bg-gray-50 dark:bg-gray-700': editing,
    }"
    :title="party.name"
    :key="index"
    @click="editing = !editing"
  >
    <div
      class="grow flex flex-col justify-center mr-2 grow truncate overflow-ellipsis"
    >
      <span v-text="party.name"></span>
    </div>
    <div
      class="shrink-0 grid grid-cols-[30px_1fr] place-items-center h-full absolute inset-y-0 right-0"
    >
      <div
        class="w-full h-full bg-gradient-to-l from-gray-50 dark:from-gray-700 group-hover:from-gray-100 dark:group-hover:from-gray-600 to-transparent"
      ></div>
      <div
        class="px-3 bg-gray-50 group-hover:bg-gray-100 dark:bg-gray-700 dark:group-hover:bg-gray-600 min-w-4 h-full grid place-items-center"
      >
        <div
          @click.stop="parties.activateParty(index)"
          v-show="!party.players.filter((player) => player.active).length"
          class="h-full hidden place-items-center group-hover:grid text-gray-900 dark:text-gray-100"
        >
          <div>Make all active <i class="fa fa-users"></i></div>
        </div>
        <div
          @click.stop="parties.deactivateParty(index)"
          v-show="party.players.filter((player) => player.active).length"
          class="h-full hidden place-items-center group-hover:grid text-gray-900 dark:text-gray-100"
        >
          <div>Deactivate all <i class="fa fa-users-slash"></i></div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-show="editing"
    class="border-x border-gray-50 dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-x-1 gap-y-2 px-6 py-3"
  >
    <div class="flex items-center">
      <input v-model="party.name" type="text" class="!mb-0 py-0.5 text-xl" />
      <div class="w-[30px] ml-2 flex justify-center">
        <i
          @click.stop="parties.deleteParty(index)"
          :title="'Delete ' + party.name"
          class="fa fa-trash hover:text-red-400 dark:hover:text-red-600 cursor-pointer"
        ></i>
      </div>
    </div>

    <div
      class="text-gray-600 dark:text-gray-300 grid gap-2 grid-cols-[60px_1fr_1fr] md:grid-cols-[60px_1fr_50px_75px_150px_30px]"
    >
      <div>Active</div>
      <div>Name<span class="md:hidden">/Init.</span></div>
      <div>Level<span class="md:hidden">/HP</span></div>
      <div class="hidden md:block md:order-6"></div>
      <div class="hidden md:block">Initiative</div>
      <div class="hidden md:block">HP</div>
    </div>

    <div v-for="(player, playerIndex) of party.players" :key="playerIndex">
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
          @click="parties.deletePlayer(index, playerIndex)"
          class="order-4 md:order-6 group cursor-pointer grid place-items-center mb-2 md:mb-0"
        >
          <i
            class="fa fa-times text-red-500 dark:text-red-500 group-hover:text-red-600 dark:group-hover:text-red-700"
          ></i>
        </div>
      </div>
    </div>

    <button
      @click="parties.createPlayer(index)"
      type="button"
      class="button-primary-outline-md col-span-6 justify-center"
      :class="{ 'h-24': !party.players.length }"
    >
      Create player
    </button>
    <button
      v-show="!party.players.length"
      @click="parties.deleteParty(index)"
      type="button"
      class="button-danger-outline-md col-span-6 justify-center"
    >
      Delete Party
    </button>
  </div>
</template>

<script setup>
import { useParty } from "../stores/party";
import { ref } from "vue";
import PlayerInputGroup from "./PlayerInputGroup.vue";

const parties = useParty();

defineProps({
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

    <PlayerInputGroup
      v-for="(player, playerIndex) of party.players"
      :player="player"
      :key="playerIndex"
      @delete="parties.deletePlayer(index, playerIndex)"
    ></PlayerInputGroup>

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

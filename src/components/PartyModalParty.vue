<script setup>
import { useParty } from "../stores/party";
import { ref, watch } from "vue";
import PlayerInputGroup from "./PlayerInputGroup.vue";
import ToggleInput from "./ToggleInput.vue";

const parties = useParty();

const props = defineProps({
  party: Object,
  index: Number,
});

const active = ref(
  props.party.players.filter((player) => player.active).length
);

watch(
  () => active.value,
  (value) => {
    if (value) {
      parties.activateParty(props.index);
    } else {
      parties.deactivateParty(props.index);
    }
  }
);

const editing = ref(false);
const editingMembership = ref(false);
</script>

<template>
  <div
    class=""
    :class="{
      'flex px-4 dark:border-gray-700 w-100 relative cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600': true,
      'bg-gray-100 hover:bg-gray-50 dark:bg-gray-700': editing,
      'py-4': !editing,
    }"
    :title="party.name"
    :key="index"
    @click="editing = !editing"
  >
    <div
      class="grow flex justify-between mr-2 truncate overflow-ellipsis items-center"
    >
      <div>
        <span v-text="party.name"></span>
      </div>
      <div class="flex items-center space-x-2">
        <span
          v-text="
            `${party.players.filter((player) => player.active).length} / ${
              party.players.length
            }`
          "
        ></span>
        <i :class="{ 'fa fa-users': active, 'fa fa-users-slash': !active }"></i>
        <ToggleInput
          v-model="active"
          @click.stop
          darker="true"
          class="p-1"
        ></ToggleInput>
      </div>
    </div>
  </div>

  <div
    v-show="editing"
    class="border border-gray-50 dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-y-2 gap-x-1 px-6 py-3 m-px rounded-b"
  >
    <div class="flex items-center">
      <input v-show="editingMembership" v-model="party.name" type="text" class="!mb-0 py-0.5 text-xl" />
      <div class="flex space-x-1 flex-grow self-stretch text-2xl" v-show="!editingMembership" v-text="party.name"></div>
      <div class="ml-2 flex space-x-1 justify-center self-stretch">
        <button
          @click.stop="parties.deleteParty(index)"
          v-if="editingMembership"
          :title="'Delete ' + party.name"
          type="button"
          class="button-danger-outline-md"
        >
          <i class="fa fa-trash"></i>
        </button>
        <button
          @click.stop="editingMembership = !editingMembership"
          :title="'Edit membership of ' + party.name"
          class="button-muted-outline-md"
        >
          <i class="fa fa-pencil"></i>
        </button>
      </div>
    </div>

    <div
      class="grid gap-2 grid-cols-[1fr_1fr_60px] md:grid-cols-[1fr_50px_75px_150px_60px] -mb-1 mt-2"
    >
      <div>Name<span class="md:hidden">/Init.</span></div>
      <div>Level<span class="md:hidden">/HP</span></div>
      <div class="hidden md:block md:order-6"></div>
      <div class="hidden md:block">Initiative</div>
      <div class="hidden md:block">HP</div>
      <div
        class="text-end"
        v-text="editingMembership ? 'Delete' : 'Active'"
      ></div>
    </div>

    <PlayerInputGroup
      v-for="(player, playerIndex) of party.players"
      :player="player"
      :key="playerIndex"
      :editing="editingMembership"
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

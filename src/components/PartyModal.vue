<script setup>
import Modal from "./Modal.vue";
import { useParty } from "../stores/party";
import {useModals} from "../stores/modals";

const parties = useParty();
const modals = useModals();
</script>

<template>
  <Modal v-model:show="modals.party" title="Manage your parties and players">
    <div class="my-3 sm:mt-0 w-full">
      <div
        class="my-2 max-h-96 overflow-y-auto scrollbar overflow-x-hidden text-gray-700 dark:text-gray-300"
      >
        <div
          v-show="parties.saved.length"
          class="bg-gray-50 dark:bg-gray-700 rounded shadow overflow-hidden border-b dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-800"
        >
          <div v-for="(party, partyIndex) of parties.saved" :key="party.id">
            <div
              class="flex px-4 py-4 dark:border-gray-700 w-100 relative cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600"
              :class="{
                'bg-gray-100 hover:bg-gray-50 dark:bg-gray-700': party.editing,
              }"
              :title="party.name"
              :key="partyIndex"
              @click="party.editing = !party.editing"
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
                    @click.stop="parties.activateParty(partyIndex)"
                    v-show="
                      !party.players.filter((player) => player.active).length
                    "
                    class="h-full hidden place-items-center group-hover:grid text-gray-900 dark:text-gray-100"
                  >
                    <div>Make all active <i class="fa fa-users"></i></div>
                  </div>
                  <div
                    @click.stop="parties.deactivateParty(partyIndex)"
                    v-show="
                      party.players.filter((player) => player.active).length
                    "
                    class="h-full hidden place-items-center group-hover:grid text-gray-900 dark:text-gray-100"
                  >
                    <div>Deactivate all <i class="fa fa-users-slash"></i></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-show="party.editing"
              class="border-x border-gray-50 dark:border-gray-700 dark:bg-gray-800 flex flex-col gap-x-1 gap-y-2 px-6 py-3"
            >
              <div class="flex items-center">
                <input
                  v-model="party.name"
                  type="text"
                  class="!mb-0 py-0.5 text-xl"
                />
                <div class="w-[30px] ml-2 flex justify-center">
                  <i
                    @click.stop="parties.deleteParty(partyIndex)"
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

              <div v-for="(player, playerIndex) of party.players">
                <div
                  class="grid gap-2 grid-cols-[60px_1fr_1fr] md:grid-cols-[60px_1fr_50px_75px_150px_30px]"
                >
                  <div class="order-1 flex justify-center md:justify-start">
                    <input
                      type="checkbox"
                      class="hidden"
                      v-model="player.active"
                    />

                    <button
                      @click="player.active = !player.active"
                      type="button"
                      :class="{
                        'bg-gray-200 dark:bg-gray-700': !player.active,
                        'bg-emerald-600': player.active,
                      }"
                      class="bg-gray-200 dark:bg-gray-700 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      role="switch"
                      aria-checked="false"
                      aria-labelledby="availability-label"
                      aria-describedby="availability-description"
                    >
                      <span
                        aria-hidden="true"
                        :class="{
                          'translate-x-0': !player.active,
                          'translate-x-5': player.active,
                        }"
                        class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                      ></span>
                    </button>
                  </div>

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
                      @click="
                        player.initiativeAdvantage = !player.initiativeAdvantage
                      "
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
                    @click="parties.deletePlayer(partyIndex, playerIndex)"
                    class="order-4 md:order-6 group cursor-pointer grid place-items-center mb-2 md:mb-0"
                  >
                    <i
                      class="fa fa-times text-red-500 dark:text-red-500 group-hover:text-red-600 dark:group-hover:text-red-700"
                    ></i>
                  </div>
                </div>
              </div>

              <button
                @click="parties.createPlayer(partyIndex)"
                type="button"
                class="button-primary-outline-md col-span-6 justify-center"
                :class="{ 'h-24': !party.players.length }"
              >
                Create player
              </button>
              <button
                v-show="!party.players.length"
                @click="parties.deleteParty(partyIndex)"
                type="button"
                class="button-danger-outline-md col-span-6 justify-center"
              >
                Delete Party
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        v-show="!parties.saved.length"
        @click="parties.createParty"
        type="button"
        class="relative block w-full border-2 border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <i
          class="fa-solid fa-users text-2xl h-12 w-12 mx-auto text-gray-400 dark:text-gray-300"
        ></i>
        <span
          class="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200"
        >
          Create player party
        </span>
      </button>
    </div>

    <template #footer>
      <button
        @click="modals.hide('party')"
        type="button"
        class="button-primary-md"
      >
        Close
      </button>
      <button
        @click="parties.createParty"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 dark:bg-emerald-100 dark:bg-transparent dark:text-emerald-500 dark:hover:bg-emerald-800 dark:hover:text-white hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <i class="fa fa-plus mr-1"></i> Create party
      </button>
    </template>
  </Modal>
</template>

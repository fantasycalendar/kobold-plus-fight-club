<script setup>
import Modal from "./Modal.vue";
import { useParty } from "../stores/party";
import { useModals } from "../stores/modals";
import PartyModalParty from "./PartyModalParty.vue";

const parties = useParty();
const modals = useModals();
</script>

<template>
  <Modal v-model:show="modals.party" title="Manage your parties and players">
    <div class="my-3 sm:mt-0 w-full">
      <div
        class="my-2 max-h-96 overflow-y-auto scrollbar scrollbar-dark overflow-x-hidden text-gray-700 dark:text-gray-300"
      >
        <div
          v-show="parties.saved.length"
          class="bg-gray-50 dark:bg-gray-700 rounded shadow overflow-hidden dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-800"
        >
          <PartyModalParty
            v-for="(party, partyIndex) of parties.saved"
            :party="party"
            :index="partyIndex"
            :key="party.id"
          ></PartyModalParty>
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

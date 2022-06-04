import { defineStore } from "pinia";

export const useModals = defineStore("modals", {
  state: () => {
    return {
      importer: false,
      encounter: false,
      sources: false,
      party: false,
      keyboard: false,
    };
  },
  actions: {
    show(modalName) {
      this[modalName] = true;
    },
    hide(modalName) {
      this[modalName] = false;
    },
  },
});

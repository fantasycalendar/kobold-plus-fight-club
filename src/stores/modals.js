import { defineStore,acceptHMRUpdate } from "pinia";

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
    toggle(modalName) {
      this[modalName] = !this[modalName];
    },
    closeAll() {
      ["importer", "encounter", "sources", "party", "keyboard"].forEach(
        (modal) => {
          this.hide(modal);
      });
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModals, import.meta.hot));
}
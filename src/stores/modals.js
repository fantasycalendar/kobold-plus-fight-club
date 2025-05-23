import { acceptHMRUpdate, defineStore } from "pinia";

export const useModals = defineStore("modals", {
  state: () => {
    return {
      importer: false,
      encounter: false,
      strategy: false,
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
      ["importer", "encounter", "sources", "strategy", "party", "keyboard"].forEach(
        (modal) => {
          this.hide(modal);
        });
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModals, import.meta.hot));
}

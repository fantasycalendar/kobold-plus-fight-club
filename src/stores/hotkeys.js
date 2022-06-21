import { defineStore,acceptHMRUpdate } from "pinia";
import hotkeys from "hotkeys-js";

export const useHotkeys = defineStore("hotkeys", {
  state: () => {
    return {
      definitions: [],
    };
  },
  actions: {
    register(shortcut, description, callback, sortBy = null, hidden = false) {
      sortBy = sortBy ?? this.definitions.length + 1;

      this.definitions.push({
        shortcut,
        description,
        hidden,
        sortBy,
      });

      hotkeys(shortcut, callback);
    },
  },
  getters: {
    help() {
      return this.definitions
        .filter((definition) => !definition.hidden)
        .sort((a, b) => (a.sortBy < b.sortBy ? -1 : 1))
        .map((definition) => {
          return {
            shortcut: definition.shortcut,
            description: definition.description,
          };
        });
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHotkeys, import.meta.hot));
}
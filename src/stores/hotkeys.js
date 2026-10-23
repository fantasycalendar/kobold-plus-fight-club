import { acceptHMRUpdate, defineStore } from "pinia";
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

      const definition = { shortcut, description, hidden, sortBy };

      // Components can re-register their shortcuts when they are re-created
      // (e.g. navigating away and back to a routed view). Replace any existing
      // definition for the same shortcut instead of pushing a duplicate, which
      // would both leak entries into the help list and bind the hotkey handler
      // multiple times.
      const existingIndex = this.definitions.findIndex(
        (existing) => existing.shortcut === shortcut
      );
      if (existingIndex === -1) {
        this.definitions.push(definition);
      } else {
        this.definitions[existingIndex] = definition;
      }

      // Unbind any previous handler for this shortcut before binding the new
      // one so the callback doesn't fire multiple times per keypress.
      hotkeys.unbind(shortcut);
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

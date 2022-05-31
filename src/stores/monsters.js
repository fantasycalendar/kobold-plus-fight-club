import { defineStore } from "pinia";
import { useFilters } from "./filters";
import CONST from "../js/constants";
import { useLocalStorage } from "@vueuse/core/index";

const regexCache = {};

export const useMonsters = defineStore("monsters", {
  state: () => {
    return {
      lastRegex: "",
      all: useLocalStorage("monsters", []),
    };
  },

  hydrate(storeState, initialState) {
    storeState.all = useLocalStorage("monsters", []);
  },

  actions: {
    async fetch() {
      try {
        this.all = await fetch("/src/assets/json/se_monsters.json").then(
          (res) => res.json()
        );
      } catch (error) {
        alert(error);

        return error;
      }

      return this.all;
    },

    filterBy(filters) {
      return this.all.filter((monster) => {
        const crString = false;

        if (
          filters.size.length &&
          !filters.size.includes(monster.size.toLowerCase())
        )
          return false;

        for (let legendary of filters.legendary) {
          let legendaryMonsterKey = CONST.LEGENDARY_MAP[legendary];

          if (legendaryMonsterKey) {
            if (!monster.data.legendary[legendaryMonsterKey]) return false;
          } else {
            if (monster.legendary || monster.lair) return false;
          }
        }

        if (
          filters.type.length &&
          !filters.type.includes(monster.type.toLowerCase())
        )
          return false;

        if (
          filters.environment.length &&
          !filters.environment.find(
            (environment) => monster.environments.indexOf(environment) > -1
          )
        ) {
          return false;
        }

        return true;
      });
    },
  },

  getters: {
    filtered() {
      const filters = useFilters();

      return this.filterBy(filters);
    },
  },
});

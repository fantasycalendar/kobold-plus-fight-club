import { defineStore } from "pinia";
import { useFilters } from "./filters";
import CONST from "../js/constants";
import { useLocalStorage } from "@vueuse/core/index";
import Monster from "../js/monster";

const regexCache = {};

export const useMonsters = defineStore("monsters", {
  state: () => {
    return {
      lastRegex: "",
      builtIn: useLocalStorage("monsters", []),
      imported: useLocalStorage("imported_monsters", []),
      lookup: useLocalStorage("monster_lookup", {}),
    };
  },

  hydrate(storeState, initialState) {
    storeState.builtIn = useLocalStorage("monsters", []);
    storeState.imported = useLocalStorage("imported_monsters", []);
    storeState.lookup = useLocalStorage("monster_lookup", {});
  },

  actions: {
    async fetch() {
      let fetched = [];

      try {
        await fetch("/src/assets/json/se_monsters.json")
          .then((res) => res.json())
          .then((data) => {
            fetched = fetched.concat(data);
          });

        await fetch("/src/assets/json/se_third_party_monsters.json")
          .then((res) => res.json())
          .then((data) => {
            fetched = fetched.concat(data);
          });

        await fetch("/src/assets/json/se_community_monsters.json")
          .then((res) => res.json())
          .then((data) => {
            fetched = fetched.concat(data);
          });
      } catch (error) {
        alert(error);

        return error;
      }

      this.builtIn = fetched;

      console.log(this.builtIn);

      return this.builtIn;
    },

    includeMonster(monster) {
      monster = new Monster(monster);
      if (this.lookup[monster.slug]) {
        return false;
      }
      this.lookup[monster.slug] = monster;
      return monster;
    },

    addToImported(monsters) {
      this.imported = this.imported.concat(this.includeMonster());
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
            (environment) => monster.environment.includes(environment.toLowerCase())
          )
        ) {
          return false;
        }

        return true;
      });
    },
  },

  getters: {
    all() {
      return this.instanced.concat(this.instancedImports);
    },
    instanced() {
      return this.builtIn
        .map((monster) => new Monster(monster))
        .filter(Boolean);
    },
    instancedImports() {
      return this.imported
          .map((monster) => new Monster(monster))
          .filter(Boolean);
    },
    filtered() {
      const filters = useFilters();

      return this.filterBy(filters);
    },
  },
});

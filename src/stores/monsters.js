import { defineStore } from "pinia";
import { useFilters } from "./filters";
import CONST from "../js/constants";
import { useLocalStorage } from "@vueuse/core/index";
import Monster from "../js/monster";

const regexCache = {};

export const useMonsters = defineStore("monsters", {
  state: () => {
    return {
      all: [],
      lastRegex: "",
      builtIn: useLocalStorage("monsters", []),
      imported: useLocalStorage("imported_monsters", []),
      lookup: [], // useLocalStorage("monster_lookup", {}),
      instanced: [],
      instancedImports: [],
      loading: true,
    };
  },

  hydrate(storeState, initialState) {
    storeState.builtIn = useLocalStorage("monsters", []);
    storeState.imported = useLocalStorage("imported_monsters", []);
    storeState.lookup = []; //useLocalStorage("monster_lookup", {});
  },

  actions: {
    async fetch() {
      let fetched = [];

      if (!this.builtIn.length) {
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
      }

      this.instanced = this.builtIn
        .map((monster) => this.includeMonster(monster))
        .filter(Boolean);

      if (this.imported.length) {
        this.instancedImports = this.imported
          .map((monster) => this.includeMonster(monster))
          .filter(Boolean);
      }

      this.all = this.instanced.concat(this.instancedImports);

      this.loading = false;

      return this.all;
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
        if (filters.search && !filters.searchFor(monster.searchable)) {
          return false;
        }

        const crString = false;

        if (
          filters.size.length &&
          !filters.size.includes(monster.size.toLowerCase())
        )
          return false;

        if (filters.legendary.indexOf("legendary") > -1 && !monster.legendary) {
          return false;
        }

        if (filters.legendary.indexOf("legendary_lair") > -1 && !monster.lair) {
          return false;
        }

        if (
          filters.type.length &&
          !filters.type.includes(monster.type.toLowerCase())
        )
          return false;

        if (
          filters.environment.length &&
          !filters.environment.find((environment) =>
            monster.environment.includes(environment.toLowerCase())
          )
        ) {
          return false;
        }

        if (!crString && (filters.minCr > 0 || filters.maxCr < 30)) {
          if (filters.minCr > 0 && monster.cr.numeric < filters.minCr) {
            return false;
          }

          if (filters.maxCr < 30 && monster.cr.numeric > filters.maxCr) {
            return false;
          }
        }

        return true;
      });
    },
  },

  getters: {
    paginated: (state) => {
      return (page, sortFunction = null) => {
        const filters = useFilters();
        if(!sortFunction) {
          sortFunction = (a, b) => a.name.localeCompare(b.name);
        }

        return state.filtered
          .sort(sortFunction)
          .slice((page - 1) * filters.perPage, page * filters.perPage);
      };
    },
    filtered() {
      const filters = useFilters();

      return this.filterBy(filters);
    },
  },
});

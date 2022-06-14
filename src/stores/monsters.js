import { defineStore, acceptHMRUpdate } from "pinia";
import { useFilters } from "./filters";
import CONST from "../js/constants";
import { useLocalStorage } from "@vueuse/core/index";
import Monster from "../js/monster";
import { versionCompare } from "../js/helpers";

const regexCache = {};

export const useMonsters = defineStore("monsters", {
  state: () => {
    return {
      version: "2.1.0",
      storedVersion: useLocalStorage("storedMonstersVersion", "2.1.0"),

      lastRegex: "",
      builtIn: useLocalStorage("monsters", []),
      imported: useLocalStorage("importedMonsters", []),
      lookup: [], // useLocalStorage("monster_lookup", {}),
      instanced: [],
      instancedImports: [],
      loading: true,
    };
  },
  actions: {
    async fetch() {
      let fetched = [];

      if (
        !this.builtIn.length ||
        versionCompare(this.version, this.storedVersion) !== 0
      ) {
        try {
          await fetch("/json/se_monsters.json")
            .then((res) => res.json())
            .then((data) => {
              fetched = fetched.concat(data);
            });

          await fetch("/json/se_third_party_monsters.json")
            .then((res) => res.json())
            .then((data) => {
              fetched = fetched.concat(data);
            });

          await fetch("/json/se_community_monsters.json")
            .then((res) => res.json())
            .then((data) => {
              fetched = fetched.concat(data);
            });
        } catch (error) {
          alert(error);

          return error;
        }

        this.storedVersion = this.version;
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

      this.loading = false;

      return this.instanced;
    },

    includeMonster(monster) {
      monster = new Monster(monster);
      if (this.lookup[monster.slug]) {
        return false;
      }
      this.lookup[monster.slug] = monster;
      return monster;
    },

    import(monsters) {
      const instancedMonsters = monsters
        .map(this.includeMonster)
        .filter(Boolean);

      if (!instancedMonsters.length) {
        return {
          success: false,
          message: "Monster import only contained duplicates",
        };
      }

      this.imported = [...this.imported, ...monsters];
      this.instancedImports = [...this.instancedImports, ...instancedMonsters];

      return {
        success: true,
        message: "Successfully imported monsters",
      };
    },

    removeFromSource(source) {
      this.imported = this.imported.filter(
        (monster) => !monster.sources.startsWith(source.name)
      );

      this.instancedImports = this.imported
        .map((monster) => new Monster(monster))
        .filter(Boolean);
    },

    filterBy(filters, filterCallback = () => true) {
      return filters
        .reduce((monsters, filter) => monsters.filter(filter), this.enabled)
        .filter(filterCallback);
    },
  },

  getters: {
    all() {
      return [...this.instanced, ...this.instancedImports];
    },
    enabled() {
      return this.all.filter((monster) => monster.sourceEnabled);
    },
    paginated: (state) => {
      return (page, sortFunction = null) => {
        const filters = useFilters();
        if (!sortFunction) {
          sortFunction = (a, b) => a.name.localeCompare(b.name);
        }

        return state.filtered
          .sort(sortFunction)
          .slice((page - 1) * filters.perPage, page * filters.perPage);
      };
    },
    filtered() {
      const filters = useFilters();

      return this.filterBy(filters.active);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMonsters, import.meta.hot));
}

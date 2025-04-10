import { acceptHMRUpdate, defineStore } from "pinia";
import { useMonsters } from "./monsters";
import * as helpers from "../js/helpers.js";
import CONST from "../js/constants.js";

export const useFilters = defineStore("filters", {
  state: () => {
    return {
      defaults: {
        search: "",
        alignment: {
          bits: 1023,
        },
        size: [],
        legendary: [],
        type: [],
        environment: [],
        cr: {
          min: 0,
          max: 33,
        },
      },
      alignment: {
        bits: 1023,
      },
      size: helpers.migrateLocalStorage("filtersSize", "size", []),
      sizeOptions: [
        { value: "tiny", label: "Tiny" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "huge", label: "Huge" },
        { value: "gargantuan", label: "Gargantuan" },
        { value: "not-tiny", label: "Not Tiny" },
        { value: "not-small", label: "Not Small" },
        { value: "not-medium", label: "Not Medium" },
        { value: "not-large", label: "Not Large" },
        { value: "not-huge", label: "Not Huge" },
        { value: "not-gargantuan", label: "Not Gargantuan" },
      ],
      legendary: helpers.migrateLocalStorage(
        "filtersLegendary",
        "legendary",
        []
      ),
      legendaryOptions: [
        { value: "ordinary", label: "Ordinary" },
        { value: "legendary", label: "Legendary" },
        { value: "legendary_lair", label: "Legendary (in lair)" },
      ],
      type: helpers.migrateLocalStorage("filtersType", "type", []),
      typeOptions: [
        { value: "aberration", label: "Aberration" },
        { value: "beast", label: "Beast" },
        { value: "celestial", label: "Celestial" },
        { value: "construct", label: "Construct" },
        { value: "dragon", label: "Dragon" },
        { value: "elemental", label: "Elemental" },
        { value: "fey", label: "Fey" },
        { value: "fiend", label: "Fiend" },
        { value: "giant", label: "Giant" },
        { value: "humanoid", label: "Humanoid" },
        { value: "monstrosity", label: "Monstrosity" },
        { value: "ooze", label: "Ooze" },
        { value: "plant", label: "Plant" },
        { value: "undead", label: "Undead" },
        { value: "not-aberration", label: "Not Aberration" },
        { value: "not-beast", label: "Not Beast" },
        { value: "not-celestial", label: "Not Celestial" },
        { value: "not-construct", label: "Not Construct" },
        { value: "not-dragon", label: "Not Dragon" },
        { value: "not-elemental", label: "Not Elemental" },
        { value: "not-fey", label: "Not Fey" },
        { value: "not-fiend", label: "Not Fiend" },
        { value: "not-giant", label: "Not Giant" },
        { value: "not-humanoid", label: "Not Humanoid" },
        { value: "not-monstrosity", label: "Not Monstrosity" },
        { value: "not-ooze", label: "Not Ooze" },
        { value: "not-plant", label: "Not Plant" },
        { value: "not-undead", label: "Not Undead" },
      ],
      environment: helpers.migrateLocalStorage(
        "filtersEnvironment",
        "environment",
        []
      ),
      cr: helpers.migrateLocalStorage("filtersCr", "cr", {
        min: 0,
        max: 33,
      }),
      crValues: [
        { value: "0", label: "0" },
        { value: "1/8", label: "1/8" },
        { value: "1/4", label: "1/4" },
        { value: "1/2", label: "1/2" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
        { value: "6", label: "6" },
        { value: "7", label: "7" },
        { value: "8", label: "8" },
        { value: "9", label: "9" },
        { value: "10", label: "10" },
        { value: "11", label: "11" },
        { value: "12", label: "12" },
        { value: "13", label: "13" },
        { value: "14", label: "14" },
        { value: "15", label: "15" },
        { value: "16", label: "16" },
        { value: "17", label: "17" },
        { value: "18", label: "18" },
        { value: "19", label: "19" },
        { value: "20", label: "20" },
        { value: "21", label: "21" },
        { value: "22", label: "22" },
        { value: "23", label: "23" },
        { value: "24", label: "24" },
        { value: "25", label: "25" },
        { value: "26", label: "26" },
        { value: "27", label: "27" },
        { value: "28", label: "28" },
        { value: "29", label: "29" },
        { value: "30", label: "30" },
      ],

      search: helpers.migrateLocalStorage("filtersSearch", "search", ""),
      regexedSearch: "",
      regex: null,
      isValidRegex: false,

      perPage: helpers.migrateLocalStorage(
        "filtersMonstersPerPage",
        "monstersPerPage",
        10
      ),
    };
  },
  actions: {
    searchFor(searchable) {
      return this.isRegex
        ? searchable.match(this.regex)
        : searchable.includes(this.search.toLowerCase());
    },
    reset() {
      return Object.entries(this.defaults).forEach(
        ([field, value]) => (this[field] = JSON.parse(JSON.stringify(value)))
      );
    },
    isDefault(field) {
      return (
        JSON.stringify(this[field]) === JSON.stringify(this.defaults[field])
      );
    },
    overriddenCopy(overrides = {}) {
      return this.getNonDefault({
        ...helpers.clone({
          search: this.search,
          alignment: this.alignment,
          size: this.size,
          legendary: this.legendary,
          type: this.type,
          environment: this.environment,
          minCr: this.minCr,
          maxCr: this.maxCr,
        }),
        ...overrides,
      });
    },
    getNonDefault(state = this) {
      return [
        "search",
        "alignment",
        "size",
        "type",
        "environment",
        "legendary",
        "cr",
      ]
        .filter(
          (field) =>
            JSON.stringify(state[field]) !==
            JSON.stringify(this.defaults[field])
        )
        .map((filterName) => this.filterFunctions(state)[filterName]);
    },
  },
  getters: {
    filterFunctions() {
      return (state = this) => {
        return {
          search: (monster) => this.searchFor(monster.searchable),
          alignment: (monster) => monster.alignment.bits & state.alignment.bits,
          size: (monster) => monster.filter("size", state.size),
          type: (monster) => monster.filter("type", state.type),
          environment: (monster) => monster.filter("environment", state.environment),
          legendary: (monster) =>
            !(state.legendary.includes("legendary") && !monster.legendary) &&
            !(state.legendary.includes("legendary_lair") && !monster.lair) &&
            !(
              state.legendary.includes("ordinary") &&
              (monster.legendary || monster.lair)
            ),
          cr: (monster) =>
            !(
              (state.minCr > 0 && monster.cr.numeric < state.minCr) ||
              (state.maxCr < 30 && monster.cr.numeric > state.maxCr)
            ),
        };
      };
    },
    active() {
      return this.getNonDefault();
    },
    searchPlaceholder() {
      let monsters = useMonsters();

      return monsters.all.length
        ? monsters.all[Math.floor(Math.random() * monsters.all.length)].name
        : "Search for a monster";
    },
    isRegex() {
      if (!this.search) {
        // Wait ... How'd you get here??
        this.regexedSearch = "";
        this.regex = null;
        this.isValidRegex = false;
        return false;
      }

      // We already know the answer for this search term
      if (this.search === this.regexedSearch) {
        return this.isValidRegex;
      }

      this.regexedSearch = this.search;

      // Want to determine whether something is a valid regex?
      // Try to make a regex out of it and listen for yelling.
      let checkRegex = this.search.match(/^\/(.*?)\/?$/);
      if (checkRegex) {
        try {
          this.regex = new RegExp(checkRegex[1], "i");
          this.isValidRegex = true;

          return true;
        } catch (e) {
          this.regex = null;
          this.isValidRegex = false;
          return false;
        }
      }

      // If we got this far ... it wasn't regex.
      this.regex = null;
      this.isValidRegex = false;
      return false;
    },
    minCr() {
      return CONST.CR[this.crValues[this.cr.min].value].numeric;
    },
    maxCr() {
      return CONST.CR[this.crValues[this.cr.max].value].numeric;
    },
    activeCount() {
      return this.getNonDefault().length;
    },
    environmentOptions() {
      let results = new Set(
        useMonsters()
          .all.filter(Boolean)
          .filter(monster => monster.sourceEnabled)
          .map((monster) => {
            return monster.environment
              .map(
                (item) =>
                  item.trim().toUpperCase().slice(0, 1) +
                  item.trim().substring(1)
              );
          })
          .flat()
          .filter(Boolean)
      );

      results = Array.from(results).sort();

      return results.map((item) => {
        return {
          valueProp: item.toLowerCase(),
          label: item,
        };
      }).concat(results.map((item) => {
        return {
          valueProp: "not-" + item.toLowerCase(),
          label: "Not " + item,
        };
      }));
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilters, import.meta.hot));
}

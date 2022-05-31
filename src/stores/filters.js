import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import { useMonsters } from "./monsters";

export const useFilters = defineStore("filters", {
  hydrate(storeState, initialState) {
    storeState.size = useLocalStorage("size", []);
  },
  state: () => {
    return {
      alignment: {
        bits: 1023,
      },
      size: useLocalStorage("size", []),
      sizeOptions: [
        { value: "tiny", label: "Tiny" },
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "huge", label: "Huge" },
        { value: "gargantuan", label: "Gargantuan" },
      ],
      legendary: [],
      legendaryOptions: [
        { value: "ordinary", label: "Ordinary" },
        { value: "legendary", label: "Legendary" },
        { value: "legendary_lair", label: "Legendary (in lair)" },
      ],
      type: [],
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
      ],
      environment: [],
      cr: {
        min: 0,
        max: 30,
      },
    };
  },
  getters: {
    environmentOptions() {
      const monsters = useMonsters();

      let results = new Set(
        monsters.all
            .filter(Boolean)
          .map((monster) => {
            return monster.environment
                .split(",")
                .map(
                    (item) =>
                        item.trim().toUpperCase().slice(0, 1) +
                        item.trim().substring(1)
                )
          })
          .flat()
          .filter(Boolean)
      );

      return Array.from(results).sort();
    },
  },
});

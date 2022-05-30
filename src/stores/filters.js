import { defineStore } from "pinia";

export const useFilters = defineStore("filters", {
  state: () => {
    return {
      alignment: {
        bits: 0,
      },
      size: [],
      legendary: [],
      type: [],
      environment: [],
      cr: {
        min: 0,
        max: 30,
      },
    };
  },
});

import { defineStore } from "pinia";

export const useFilters = defineStore("filters", {
  state: () => {
    return {
      alignment: {
        bits: 0,
      },
      size: useLocalStorage([]),
      sizeOptions: [
        { value: 'tiny', label: 'Tiny' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
        { value: 'huge', label: 'Huge' },
        { value: 'gargantuan', label: 'Gargantuan' },
      ],
      legendary: [],
      legendaryOptions: [
        { value: 'ordinary', label: 'Ordinary' },
        { value: 'legendary', label: 'Legendary' },
        { value: 'legendary_lair', label: 'Legendary (in lair)' },
      ],
      type: [],
      typeOptions: [
        { value: 'aberration', label: 'Aberration' },
        { value: 'beast', label: 'Beast' },
        { value: 'celestial', label: 'Celestial' },
        { value: 'construct', label: 'Construct' },
        { value: 'dragon', label: 'Dragon' },
        { value: 'elemental', label: 'Elemental' },
        { value: 'fey', label: 'Fey' },
        { value: 'fiend', label: 'Fiend' },
        { value: 'giant', label: 'Giant' },
        { value: 'humanoid', label: 'Humanoid' },
        { value: 'monstrosity', label: 'Monstrosity' },
        { value: 'ooze', label: 'Ooze' },
        { value: 'plant', label: 'Plant' },
        { value: 'undead', label: 'Undead' },
      ],
      environment: [],
      environmentOptions: [],
      cr: {
        min: 0,
        max: 30,
      },
    };
  },
});

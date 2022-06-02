import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import { EXP } from "../js/constants";

export const useParty = defineStore("party", {
  state: () => {
    return {
      defaultGroup: {
        players: 4,
        level: 1,
        getsXP: true,
      },
      groups: useLocalStorage("groups", [...this.defaultGroup]),
    };
  },
  hydrate(storeState) {
    storeState.groups = useLocalStorage("groups", [...this.defaultGroup]);
  },
  actions: {
    addGroup() {
      const lastGroup =
        this.groups[this.groups.length - 1] ?? this.defaultGroup;

      this.groups.push({ ...lastGroup });
    },
    removeGroup(index) {
      this.groups.splice(index, 1);
    },
    getGroupExperience(acc, group) {
      const groupExp = EXP[group.level];
      return {
        easy: (acc?.easy ?? 0) + groupExp.easy * (group?.players ?? 1),
        medium: (acc?.medium ?? 0) + groupExp.medium * (group?.players ?? 1),
        hard: (acc?.hard ?? 0) + groupExp.hard * (group?.players ?? 1),
        deadly: (acc?.deadly ?? 0) + groupExp.deadly * (group?.players ?? 1),
        daily: (acc?.daily ?? 0) + groupExp.daily * (group?.players ?? 1),
      };
    },
  },

  getters: {
    experience() {
      return this.groups.reduce(this.getGroupExperience, {});

      // We'll enable this once the player store is actually a thing
      // return usePlayers().active.reduce(this.getGroupExperience, experience);
    },
    totalPlayersToGainXP() {
      return this.groups.reduce(
        (acc, group) => acc + (group.getsXP ? parseInt(group.players) : 0),
        0
      );
      // We'll add this back once the player store is actually a thing
      // + usePlayers().active.length;
    },
    totalExperiencePerPlayer() {
      return 1500;
      // We'll enable this once the encounter store is actually a thing
      // return Math.round(useEncounter().totalExp / this.totalPlayersToGainXP);
    },
    totalAdjustedExperiencePerPlayer() {
      return 1300;
      // We'll enable this once the encounter store is actually a thing
      // return Math.round(useEncounter().adjustedXP / this.totalPlayersToGainXP);
    },
  },
});

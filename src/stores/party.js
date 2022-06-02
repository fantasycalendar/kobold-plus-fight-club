import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import CONST from "../js/constants.js";

export const useParty = defineStore("party", {
  state: () => {
    return {
      groups: useLocalStorage("groups", [
        {
          players: 4,
          level: 1,
          getsXP: true,
        },
      ]),
      saved: [],
    };
  },
  hydrate(storeState) {
    storeState.groups = useLocalStorage("groups", [
      {
        players: 4,
        level: 1,
        getsXP: true,
      },
    ]);
    storeState.saved = useLocalStorage("saved_parties", []);
  },
  actions: {
    addGroup() {
      const lastGroup = this.groups[this.groups.length - 1] ?? {
        players: 4,
        level: 1,
        getsXP: true,
      };

      this.groups.push({ ...lastGroup });
    },
    removeGroup(index) {
      this.groups.splice(index, 1);
    },
    getGroupExperience(acc, group) {
      const groupExp = CONST.EXP[group.level];
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
    totalPlayers() {
      return (
        this.groups.reduce((acc, group) => {
          return acc + parseInt(group.players);
        }, 0) + this.activePlayers.length
      );
    },
    activePlayers() {
      return this.saved.reduce((acc, party) => {
        return acc.concat(party.players.filter((player) => player.active));
      }, []);
    },
  },
});

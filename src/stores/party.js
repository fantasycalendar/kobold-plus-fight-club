import { defineStore,acceptHMRUpdate } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import CONST from "../js/constants.js";
import {useEncounter} from "./encounter";

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
      saved: useLocalStorage("saved_parties", []),
    };
  },
  actions: {
    ensureGroup() {
      if (!this.totalPlayers) {
        this.addGroup();
      }
    },
    addGroup() {
      const lastGroup = this.groups[this.groups.length - 1] ?? {
        id: 1,
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

    createParty() {
      this.saved.forEach((party) => (party.editing = false));
      this.saved.push({
        id: this.saved.length,
        name: "Party " + (this.saved.length + 1),
        editing: true,
        players: [],
      });
      this.createPlayer(this.saved.length - 1);
    },

    activateParty(partyIndex) {
      this.saved[partyIndex].players.forEach(
        (player) => (player.active = true)
      );
    },

    deactivateParty(partyIndex) {
      this.saved[partyIndex].players.forEach(
        (player) => (player.active = false)
      );
    },

    deleteParty(partyIndex) {
      this.saved.splice(partyIndex, 1);
    },

    playerChange(player) {
      if (player.currentHp > player.maxHp) {
        player.maxHp = player.currentHp;
      }
    },

    createPlayer(partyIndex) {
      this.saved[partyIndex].players.push({
        name: "Player " + (this.saved[partyIndex].players.length + 1),
        initiativeMod: 0,
        initiativeAdvantage: false,
        level:
          this.saved[partyIndex].players[
            this.saved[partyIndex].players.length - 1
          ]?.level ?? 1,
        maxHp:
          this.saved[partyIndex].players[
            this.saved[partyIndex].players.length - 1
          ]?.maxHp ?? 10,
        currentHp:
          this.saved[partyIndex].players[
            this.saved[partyIndex].players.length - 1
          ]?.currentHp ?? 10,
        active: false,
        partyIndex: 0,
      });
    },

    deletePlayer(partyIndex, playerIndex) {
      this.saved[partyIndex].players.splice(playerIndex, 1);
    },
  },

  getters: {
    experience() {
      if (!this.totalPlayers) {
        return false;
      }

      const experience = this.groups.reduce(this.getGroupExperience, {});
      return this.activePlayers.reduce(this.getGroupExperience, experience);
    },
    totalPlayersToGainXP() {
      return (
        this.groups.reduce(
          (acc, group) => acc + (group.getsXP ? parseInt(group.players) : 0),
          0
        ) + this.activePlayers.length
      );
    },
    totalExperiencePerPlayer() {
      return Math.round(useEncounter().totalExp / this.totalPlayersToGainXP);
    },
    totalAdjustedExperiencePerPlayer() {
      return Math.round(useEncounter().adjustedXP / this.totalPlayersToGainXP);
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

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useParty, import.meta.hot));
}
import { acceptHMRUpdate, defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import { useEncounter } from "./encounter";

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
      saved: useLocalStorage("savedParties", []),
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
      return useEncounter().encounterStrategy.getBudget();
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

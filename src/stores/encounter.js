import { acceptHMRUpdate, defineStore } from "pinia";
import { useParty } from "./party";
import * as helpers from "../js/helpers";
import { useNotifications } from "./notifications";
import { useMonsters } from "./monsters";
import { useLocalStorage } from "@vueuse/core/index";
import strategies from "../js/strategy.js";

export const useEncounter = defineStore("encounter", {
  state: () => {
    return {
      groups: useLocalStorage("encounterGroups", []),
      loadedIndex: helpers.migrateLocalStorage(
        "encounterLoadedIndex",
        "loadedEncounterIndex",
        null
      ),
      difficulty: helpers.migrateLocalStorage(
        "encounterDifficulty",
        "difficulty",
        "Moderate"
      ),
      type: helpers.migrateLocalStorage(
        "encounterGenerateType",
        "encounterType",
        "random"
      ),
      history: helpers.migrateLocalStorage(
        "encounterGenerateHistory",
        "encounterHistory",
        []
      ),
      saved: helpers.migrateLocalStorage(
        "encounterSaved",
        "savedEncounters",
        []
      ),
      availableStrategies: strategies,
      strategy: useLocalStorage("strategy", "dnd2024"),
    };
  },
  actions: {
    setStrategy(strategy) {
      this.strategy = strategy;
      this.difficulty = strategies[strategy].defaultDifficulty;
    },

    getDifficultyFromCr(cr) {
      return this.encounterStrategy.getDifficultyFromCr(cr, useParty().experience);
    },

    getDifficultyClassColorFromCr(cr) {
      return this.encounterStrategy.getDifficultyClassColorFromCr(cr, useParty().experience);
    },

    generateRandom() {
      useParty().ensureGroup();
      const newEncounter = this.encounterStrategy.generateEncounter(this.difficulty, this.type);
      if (!newEncounter) return;
      this.groups = newEncounter;
      this.saveToHistory(true);
    },

    getNewMonster(groupIndex) {
      const group = this.groups[groupIndex];
      const newMonster = this.encounterStrategy.getNewMonster(group, this.groups);
      if (!newMonster) return;
      this.groups[groupIndex].monster = newMonster;
      this.saveToHistory();
    },

    addMonster(monster) {
      if (!useParty().totalPlayers) {
        useParty().addPlayerGroup();
      }

      let group;
      let index = this.groups.findIndex((group) => group.monster === monster);
      if (index === -1) {
        this.groups.push({
          monster,
          count: 1,
        });
      } else {
        group = this.groups[index];
        group.count++;
      }

      this.saveToHistory();
    },

    addCount(index) {
      this.groups[index].count++;
      this.saveToHistory();
    },

    subtractCount(index) {
      this.groups[index].count--;
      if (this.groups[index].count <= 0) {
        this.groups.splice(index, 1);
      }
      this.saveToHistory();
    },

    saveToHistory(newEntry = false) {
      const encounter = this.groups
        .map((group) => {
          return {
            monster: {
              name: group.monster.name,
              slug: group.monster.slug,
            },
            count: group.count,
          };
        })
        .filter((group) => group.count > 0);

      const lastEntry = this.history[this.history.length - 1];
      if (!encounter.length) {
        if (lastEntry) {
          this.history.pop();
        }
        return;
      }

      if (newEntry || !lastEntry) {
        this.history.push(encounter);
      }

      this.history[this.history.length - 1] = encounter;
    },

    save() {
      if (!this.groups.length) return;
      const encounter = this.groups.map((group) => {
        return {
          monster: {
            name: group.monster.name,
            slug: group.monster.slug,
          },
          count: group.count,
        };
      });
      if (this.loaded) {
        this.saved[this.loaded] = encounter;
      } else {
        this.loadedIndex = this.saved.length;
        this.saved = [...this.saved, encounter];
      }
      useNotifications().notify({
        title: "Encounter saved",
      });
    },

    loadFromHistory(index) {
      this.loadedIndex = null;
      const encounter = this.history.splice(index, 1)[0];
      this.history.push(encounter);
      this.load(encounter);
      useNotifications().notify({
        title: "Encounter loaded",
        body: this.groups
          .map((group) => `${group.monster.name} x${group.count}`)
          .join(", "),
      });
    },

    load(encounter) {
      useParty().ensureGroup();

      const groups = helpers
        .clone(encounter)
        .map((group) => {
          group.monster = useMonsters().lookup[group.monster.slug];
          if (!group.monster) return false;
          return group;
        })
        .filter(Boolean);
      if (!groups.length) return;
      this.groups = groups;
    },

    loadFromSaved(index) {
      this.loadedIndex = index;
      this.load(this.saved[index]);
      useNotifications().notify({
        title: "Encounter loaded",
        body: this.groups
          .map((group) => `${group.monster.name} x${group.count}`)
          .join(", "),
      });
    },

    deleteSaved(index) {
      if (this.loadedIndex === index) {
        this.loadedIndex = null;
        this.clear();
      }
      this.saved.splice(index, 1);
      useNotifications().notify({ title: "Encounter deleted" });
    },

    clear() {
      this.groups = [];
      this.loadedIndex = null;
    },
  },
  getters: {

    monsterGroups() {
      return this.groups.map(group => {
        const monster = useMonsters().lookup[group.monster.slug];
        if (!monster) return false;
        return { monster, count: group.count }
      }).filter(Boolean);
    },

    totalExp() {
      return this.encounterStrategy.getTotalExp();
    },

    secondaryMeasurements() {
      return this.encounterStrategy.getSecondaryMeasurements();
    },

    budget() {
      return this.encounterStrategy.getBudget();
    },

    lastBudget() {
      const encounterBudget = this.budget;
      return {
        label: Object.keys(encounterBudget)[Object.keys(encounterBudget).length - 1],
        value: Object.values(encounterBudget)[Object.keys(encounterBudget).length - 1],
      }
    },

    difficultyFeel() {
      return this.encounterStrategy.getDifficultyFeel();
    },

    actualDifficulty() {
      return this.encounterStrategy.getActualDifficulty();
    },

    encounterStrategy() {
      return this.availableStrategies[this.strategy];
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEncounter, import.meta.hot));
}

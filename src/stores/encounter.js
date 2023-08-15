import { acceptHMRUpdate, defineStore } from "pinia";
import { useParty } from "./party";
import * as helpers from "../js/helpers";
import { useNotifications } from "./notifications";
import { useMonsters } from "./monsters";
import { useFilters } from "./filters";
import { useLocalStorage } from "@vueuse/core/index";
import strategies from "../js/strategy.js";

export const useEncounter = defineStore("encounter", {
  state: () => {
    return {
      groups: useLocalStorage("encounterGroups", []),
      insaneDifficultyStrings: [
        "an incredibly bad idea",
        "suicide",
        "/r/rpghorrorstories",
        "an angry table",
        "the BBEG wrote this encounter",
        "the party's final session",
        "someone forgot to bring snacks",
        "rocks fall",
        "someone insulted the DM",
      ],
      loadedIndex: helpers.migrateLocalStorage(
        "encounterLoadedIndex",
        "loadedEncounterIndex",
        null
      ),
      loadedLast: false,
      difficulty: helpers.migrateLocalStorage(
        "encounterDifficulty",
        "difficulty",
        "medium"
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
      strategy: useLocalStorage("strategy", "k+fc"),
    };
  },
  actions: {
    getDifficultyFromExperience(exp) {
      const levels = useParty().experience;

      if (!levels) {
        return "N/A";
      }

      if (exp === 0) return "None";
      if (exp < levels.easy) return "Trivial";
      if (exp < levels.medium) return "Easy";
      if (exp < levels.hard) return "Medium";
      if (exp < levels.deadly) return "Hard";

      return "Deadly";
    },

    generateRandom() {

      useParty().ensureGroup();

      const newEncounter = this.encounterStrategy.generateEncounter(this.difficulty, this.type);

      if(!newEncounter) return;

      this.groups = newEncounter;

      this.saveToHistory(true);
    },

    getNewMonster(group) {
      const newMonster = this.encounterStrategy.getNewMonster(group, this.groups);
      if (!newMonster) return;
      group.monster = newMonster;
      console.log(group.monster, newMonster)
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
          this.loadedLast = false;
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
      this.loadedLast = true;
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
      this.loadedLast = false;
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
      this.loadedLast = false;
      this.loadedIndex = null;
    },
  },
  getters: {
    totalExp() {
      return this.groups.reduce(
        (acc, group) => acc + group.monster.experience * group.count,
        0
      );
    },

    difficultyFeel(party) {
      if (!party.totalPlayersToGainXP) {
        return "";
      }

      if (this.adjustedExp === 0) return "";

      const levels = Object.entries(party.experience);
      for (let i = 1; i < levels.length; i++) {
        const [lowerKey, lowerValue] = levels[i - 1];
        const [upperKey, upperValue] = levels[i];
        const ratio = helpers.ratio(lowerValue, upperValue, this.adjustedExp);

        if (ratio >= 10) {
          return "... insane?";
        }

        if (upperKey === "daily" && ratio >= 0.0) {
          if (ratio >= 0.2) {
            return ratio >= 1.0
              ? "like " +
              helpers.randomArrayElement(this.insaneDifficultyStrings)
              : ratio >= 0.6
                ? "extremely deadly"
                : "really deadly";
          }
          return lowerKey;
        } else if (ratio >= 0.0 && ratio <= 1.0) {
          if (ratio > 0.7) {
            return upperKey;
          }
          return lowerKey;
        }
      }

      const ratio = helpers.ratio(0, levels[0][1], this.adjustedExp);
      return ratio > 0.5 ? "like a nuisance" : "like a minor nuisance";

    },

    adjustedExp() {
      const multiplier = this.encounterStrategy.getMultiplier(this.groups);
      console.log("multiplier", multiplier)
      return Math.floor(this.totalExp * multiplier);
    },

    actualDifficulty() {
      const levels = useParty().experience;

      if (!levels) {
        return "N/A";
      }

      if (this.adjustedExp === 0) return "None";
      if (this.adjustedExp < levels.easy) return "Trivial";
      if (this.adjustedExp < levels.medium) return "Easy";
      if (this.adjustedExp < levels.hard) return "Medium";
      if (this.adjustedExp < levels.deadly) return "Hard";

      return "Deadly";
    },

    encounterStrategy() {
      return this.availableStrategies[this.strategy];
    }
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEncounter, import.meta.hot));
}

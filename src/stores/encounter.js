import { defineStore } from "pinia";
import { useParty } from "./party";
import * as helpers from "../js/helpers";
import { useNotifications } from "./notifications";

export const useEncounter = defineStore("encounter", {
  state: () => {
    return {
      groups: [],
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
      loadedIndex: null,
      loadedLast: false,
      difficulty: "medium",
    };
  },
  actions: {
    getDifficultyFromExperience(exp) {
      const levels = useParty().experience;

      if (exp === 0) return "None";
      if (exp < levels.easy) return "Trivial";
      if (exp < levels.medium) return "Easy";
      if (exp < levels.hard) return "Medium";
      if (exp < levels.deadly) return "Hard";

      return "Deadly";
    },
    generateRandom() {
      const party = useParty();

      if (!party.totalPlayers) {
        party.addPlayerGroup();
      }

      const totalExperienceTarget = party.experience[this.difficulty];

      if (!totalExperienceTarget) return;

      let fudgeFactor = 1.1; // The algorithm is conservative in spending exp; so this tries to get it closer to the actual medium value
      let baseExpBudget = totalExperienceTarget * fudgeFactor;
      let encounterTemplate = this.getEncounterTemplate();
      let totalAvailableXP =
        baseExpBudget / this.getMultiplier(encounterTemplate.total);

      let targetExp;
      const encounter = [];
      encounterTemplate.groups.reverse();
      for (const group of encounterTemplate.groups) {
        targetExp = encounterTemplate.subtractive
          ? totalAvailableXP / encounterTemplate.groups.length
          : totalAvailableXP * group.ratio;

        targetExp /= group.count;

        const monster = this.getBestMonster(targetExp, encounter, group.count);
        if (!monster) {
          useNotifications().notify({
            title: "Failed to generate encounter!",
            body: "Change the filters so that there are more monsters to sample from.",
            icon: "fa-circle-xmark",
            icon_color: "text-red-400",
            sticky: true,
          });
          return false;
        }

        encounter.push({
          monster,
          count: group.count,
        });

        if (encounterTemplate.subtractive) {
          targetExp -= group.count * monster.cr.exp;
        }
      }

      encounter.reverse();

      this.groups = encounter;

      this.saveToHistory(true);
    },
  },
  getters: {
    totalExp() {
      return this.groups.reduce(
        (acc, group) => acc + group.monster.cr.exp * group.count
      );
    },
    totalMonsters() {
      return this.groups.reduce((acc, group) => acc + group.count, 0);
    },
    adjustedExp() {
      const multiplier = this.getMultiplier(this.totalMonsters);
      return Math.floor(this.totalExp * multiplier);
    },
    actualDifficulty() {
      return this.getDifficultyFromExperience(this.adjustedExp);
    },
    difficultyFeel() {
      if (this.adjustedExp === 0) return "";

      const levels = Object.entries(party.experience);
      for (let i = 1; i < levels.length; i++) {
        const [lowerKey, lowerValue] = levels[i - 1];
        const [upperKey, upperValue] = levels[i];
        const ratio = helpers.ratio(lowerValue, upperValue, this.adjustedExp);

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
    threat() {
      const totalPlayers = useParty().totalPlayers;
      const experience = useParty().experience;
      const mediumExp = experience.medium;
      let singleMultiplier = 1;
      let pairMultiplier = 1.5;
      let groupMultiplier = 2;
      let trivialMultiplier = 2.5;

      if (totalPlayers < 3) {
        // For small groups, increase multiplier
        singleMultiplier = 1.5;
        pairMultiplier = 2;
        groupMultiplier = 2.5;
        trivialMultiplier = 3;
      } else if (totalPlayers > 5) {
        // For large groups, reduce multiplier
        singleMultiplier = 0.5;
        pairMultiplier = 1;
        groupMultiplier = 1.5;
        trivialMultiplier = 2;
      }

      return {
        deadly: Math.floor(experience.deadly / singleMultiplier),
        hard: Math.floor(experience.hard / singleMultiplier),
        medium: Math.floor(mediumExp / singleMultiplier),
        easy: Math.floor(experience.easy / singleMultiplier),
        pair: Math.floor(mediumExp / (2 * pairMultiplier)),
        group: Math.floor(mediumExp / (4 * groupMultiplier)),
        trivial: Math.floor(mediumExp / (8 * trivialMultiplier)),
      };
    },
  },
});

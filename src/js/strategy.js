import { useNotifications } from "../stores/notifications.js";
import { useMonsters } from "../stores/monsters.js";
import CONST from "./constants.js";
import { useFilters } from "../stores/filters.js";
import * as helpers from "./helpers.js";
import { useParty } from "../stores/party.js";
import { useEncounter } from "../stores/encounter.js";

class EncounterStrategy {

  static insaneDifficultyStrings = [
    "an incredibly bad idea",
    "suicide",
    "/r/rpghorrorstories",
    "an angry table",
    "the BBEG wrote this encounter",
    "the party's final session",
    "someone forgot to bring snacks",
    "rocks fall",
    "someone insulted the DM",
  ]

  static getTotalExp() {
    return useEncounter().monsterGroups.reduce((acc, group) => {
      return acc + (group.monster.experience * group.count)
    }, 0);
  }

  static getEncounterTemplate(encounterType) {
    let template = helpers.clone(CONST.ENCOUNTER_TYPES[encounterType]);
    template = helpers.randomArrayElement(template.samples);
    if (encounterType === "random") {
      template = {
        subtractive: true,
        groups: template.map((num) => {
          return { count: num };
        }),
      };
    } else {
      template = helpers.clone(CONST.ENCOUNTER_TYPES[encounterType]);
      template = helpers.randomArrayElement(template.samples);
    }

    const players = Number(useParty().totalPlayers);
    template.groups = template.groups.map((group) => {
      if (typeof group.count === "string") {
        const parts = group.count.split("-").map((part) => {
          part = part.replaceAll("players", players);
          return eval(part);
        });
        group.count = parts.length > 1 ? helpers.randomIntBetween(...parts) : parts[0];
      }
      return group;
    });

    template.total = template.groups.reduce(
      (acc, group) => acc + group.count,
      0
    );

    if (encounterType === "random") {
      template.overallRatio = template.groups.reduce(
        (acc, group) => acc + (group.ratio || 1),
        0
      );
      template.groups.forEach((group) => {
        group.ratio = (group.ratio || 1) / template.overallRatio;
      });
    }

    return template;

  }

  static monsterFilter(monster, groupTemplate, encounter) {
    return !encounter.some((group) => group.monster.slug === monster.slug) &&
      !(groupTemplate.count > 1 && monster.isUnique);
  }

  static pickRandomMonster(monsterList) {
    return helpers.randomArrayElement(monsterList);
  }

  static getMonstersFromCR(monsterCRIndex, encounter, groupTemplate, encounterType) {

    const monsterTargetCR = CONST.CR[CONST.CR.LIST[monsterCRIndex]];

    console.log(monsterTargetCR);

    const monsters = useMonsters();

    let monsterList = monsters.filterBy(
      useFilters().overriddenCopy({
        minCr: monsterTargetCR.numeric,
        maxCr: monsterTargetCR.numeric,
      }),
      (monster) => this.monsterFilter(monster, groupTemplate, encounter, encounterType)
    );

    console.log(monsterList)

    let monsterCRNewIndex = monsterCRIndex;
    let down = true;
    while (!monsterList.length) {
      if (down) {
        monsterCRNewIndex--;
        if (monsterCRNewIndex < 0) {
          monsterCRNewIndex = monsterCRIndex;
          down = false;
        }
      } else {
        monsterCRNewIndex++;
        if (monsterCRNewIndex === CONST.CR.LIST.length - 1) {
          return false;
        }
      }

      let monsterTargetCR = CONST.CR[CONST.CR.LIST[monsterCRNewIndex]];
      monsterList = monsters.filterBy(
        useFilters().overriddenCopy({
          minCr: monsterTargetCR.numeric,
          maxCr: monsterTargetCR.numeric,
        }),
        (monster) => this.monsterFilter(monster, groupTemplate, encounter, encounterType)
      );
    }

    return this.pickRandomMonster(monsterList, groupTemplate, encounterType);

  }

  static getNewMonster(monsterGroup, encounter) {

    const monsterList = useMonsters().filterBy(
      useFilters().overriddenCopy({
        maxCr: monsterGroup.monster.cr.numeric,
        minCr: monsterGroup.monster.cr.numeric,
      }),
      (monster) => {
        return !encounter.some((group) => group.monster.slug === monster.slug);
      }
    );
    if (!monsterList.length) return;
    return helpers.randomArrayElement(monsterList);

  }

}

class KFC extends EncounterStrategy {

  static key = "k+fc"
  static label = "Classic Kobold+ Fight Club Generator"
  static difficulties = [
    { key: "easy", label: "Easy" },
    { key: "medium", label: "medium", },
    { key: "hard", label: "Hard" },
    { key: "deadly", label: "Deadly" },
  ]
  static tableHeader = "XP Goals"

  static #getGroupBudget(acc, group) {
    const groupExp = CONST.EXP[group.level];
    return {
      "Easy": (acc?.["Easy"] ?? 0) + groupExp.easy * (group?.players ?? 1),
      "Medium": (acc?.["Medium"] ?? 0) + groupExp.medium * (group?.players ?? 1),
      "Hard": (acc?.["Hard"] ?? 0) + groupExp.hard * (group?.players ?? 1),
      "Deadly": (acc?.["Deadly"] ?? 0) + groupExp.deadly * (group?.players ?? 1),
      "Daily budget": (acc?.["Daily budget"] ?? 0) + groupExp.daily * (group?.players ?? 1),
    };
  }

  static getBudget() {
    if (!useParty().totalPlayers) {
      return {};
    }
    const experience = useParty().groups.reduce(this.#getGroupBudget.bind(this), {});
    return useParty().activePlayers.reduce(this.#getGroupBudget.bind(this), experience);
  }

  static getDifficultyFeel() {

    if (!useParty().totalPlayersToGainXP) {
      return "";
    }

    const adjustedExp = this.getAdjustedExp();

    if (adjustedExp === 0) return "";

    const levels = Object.entries(useParty().experience);
    for (let i = 1; i < levels.length; i++) {
      const [lowerKey, lowerValue] = levels[i - 1];
      const [upperKey, upperValue] = levels[i];
      const ratio = helpers.ratio(lowerValue, upperValue, adjustedExp);

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

    const ratio = helpers.ratio(0, levels[0][1], adjustedExp);
    return ratio > 0.5 ? "like a nuisance" : "like a minor nuisance";

  }

  static getAdjustedExp() {
    const multiplier = this.getMultiplier(useEncounter().groups);
    return Math.floor(this.getTotalExp() * multiplier);
  }

  static getSecondaryMeasurements() {
    const adjustedExp = this.getAdjustedExp();
    return [
      {
        label: "Adjusted XP",
        rawValue: adjustedExp,
        value: helpers.formatNumber(adjustedExp) +
          ' (' +
          helpers.formatNumber(
            Math.round(
              adjustedExp / useParty().totalPlayersToGainXP
            )
          ) +
          '/player)'
      }
    ].filter(x => x.rawValue > 0);
  }

  static getActualDifficulty() {

    const budget = this.getBudget();

    if (!budget) {
      return "N/A";
    }

    const adjustedExp = this.getAdjustedExp();

    if (adjustedExp === 0) return "None";
    if (adjustedExp < budget["Easy"]) return "Trivial";
    if (adjustedExp < budget["Medium"]) return "Easy";
    if (adjustedExp < budget["Hard"]) return "Medium";
    if (adjustedExp < budget["Deadly"]) return "Hard";

    return "Deadly";

  }

  static generateEncounter(difficulty, encounterType) {

    const totalExperienceTarget = useParty().experience[difficulty];

    if (!totalExperienceTarget) return;

    let fudgeFactor = 1.1; // The algorithm is conservative in spending exp; so this tries to get it closer to the actual medium value
    let baseExpBudget = totalExperienceTarget * fudgeFactor;
    let encounterTemplate = this.getEncounterTemplate(encounterType);
    let totalAvailableXP =
      baseExpBudget / this.getMultiplier(encounterTemplate);

    const newEncounter = [];
    encounterTemplate.groups.reverse();

    for (const groupTemplate of encounterTemplate.groups) {
      let targetExp = encounterTemplate.subtractive
        ? totalAvailableXP / encounterTemplate.groups.length
        : totalAvailableXP * groupTemplate.ratio;

      targetExp /= groupTemplate.count;

      const monster = this.getBestMonster(
        targetExp,
        newEncounter,
        groupTemplate
      );
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

      newEncounter.push({
        monster,
        count: groupTemplate.count,
      });
    }

    newEncounter.reverse();

    return newEncounter;

  }

  static getBestMonster(targetExp, encounter, groupTemplate) {

    let monsterCRIndex;
    for (let i = 0; i < CONST.CR.LIST.length; i++) {
      const lowerBound = CONST.CR[CONST.CR.LIST[i]];
      const upperBound = CONST.CR[CONST.CR.LIST[i + 1]];
      if (upperBound.exp > targetExp) {
        monsterCRIndex =
          targetExp - lowerBound.exp < upperBound.exp - targetExp ? i : i + 1;
        break;
      }
    }

    return this.getMonstersFromCR(monsterCRIndex, encounter, groupTemplate);

  }

  static getMultiplier(encounter) {
    const numMonsters = encounter.reduce((acc, group) => acc + group.count, 0);

    let multiplierCategory;
    const multipliers = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

    if (numMonsters <= 3) {
      multiplierCategory = Math.max(1, numMonsters);
    } else if (numMonsters < 7) {
      multiplierCategory = 3;
    } else if (numMonsters < 11) {
      multiplierCategory = 4;
    } else if (numMonsters < 15) {
      multiplierCategory = 5;
    } else {
      multiplierCategory = 6;
    }

    if (useParty().totalPlayers < 3) {
      multiplierCategory++;
    } else if (useParty().totalPlayers > 5) {
      multiplierCategory--;
    }

    return multipliers[multiplierCategory];

  }

}

class MCDM extends EncounterStrategy {

  static key = "mcdm"
  static label = "Flee, Mortals! generator"
  static difficulties = [
    { key: "easy", label: "Easy" },
    { key: "standard", label: "Standard", },
    { key: "hard", label: "Hard" },
  ]

  static tableHeader = "CR Budget"

  static encounterCrPerCharacter = {
    1: { easy: 0.125, standard: 0.125, hard: 0.25, cap: 1 },
    2: { easy: 0.125, standard: 0.25, hard: 0.5, cap: 3 },
    3: { easy: 0.25, standard: 0.5, hard: 0.75, cap: 4 },
    4: { easy: 0.5, standard: 0.75, hard: 1, cap: 6 },
    5: { easy: 1, standard: 1.5, hard: 2.5, cap: 8 },
    6: { easy: 1.5, standard: 2, hard: 3, cap: 9 },
    7: { easy: 2, standard: 2.5, hard: 3.5, cap: 10 },
    8: { easy: 2.5, standard: 3, hard: 4, cap: 12 },
    9: { easy: 3, standard: 3.5, hard: 4.5, cap: 13 },
    10: { easy: 3.5, standard: 4, hard: 5, cap: 15 },
    11: { easy: 4, standard: 4.5, hard: 5.5, cap: 16 },
    12: { easy: 4.5, standard: 5, hard: 6, cap: 17 },
    13: { easy: 5, standard: 5.5, hard: 6.5, cap: 19 },
    14: { easy: 5.5, standard: 6, hard: 7, cap: 20 },
    15: { easy: 6, standard: 6.5, hard: 7.5, cap: 22 },
    16: { easy: 6.5, standard: 7, hard: 8, cap: 24 },
    17: { easy: 7, standard: 7.5, hard: 8.5, cap: 25 },
    18: { easy: 7.5, standard: 8, hard: 9, cap: 26 },
    19: { easy: 8, standard: 8.5, hard: 9.5, cap: 28 },
    20: { easy: 8.5, standard: 9, hard: 10, cap: 30 },
  }

  static bossEncounterCrModifiers = [
    { easy: "5-6", standard: "3-4", hard: "0-2" },
    { easy: "4-5", standard: "2-3", hard: "0-1" }
  ]

  static difficultyPoints = [0, 1, 2, 4, 8]

  static #getGroupBudget(acc, group) {
    const crGroupBudget = this.encounterCrPerCharacter[group.level];
    return {
      "Easy": (acc?.["Easy"] ?? 0) + crGroupBudget.easy * (group?.players ?? 1),
      "Standard": (acc?.["Standard"] ?? 0) + crGroupBudget.standard * (group?.players ?? 1),
      "Hard": (acc?.["Hard"] ?? 0) + crGroupBudget.hard * (group?.players ?? 1)
    };
  }

  static getBudget() {
    if (!useParty().totalPlayers) {
      return {};
    }
    let groupBudget = useParty().groups.reduce(this.#getGroupBudget.bind(this), {});
    let totalBudget = useParty().activePlayers.reduce(this.#getGroupBudget.bind(this), groupBudget);

    let totalLevels = useParty().groups.reduce((acc, group) => acc + (group.level * group.players), 0)
      + useParty().activePlayers.reduce((acc, player) => acc + player.level, 0);
    let averageLevel = Math.floor(totalLevels / useParty().totalPlayers);

    totalBudget["One Monster Cap"] = this.encounterCrPerCharacter[averageLevel].cap;

    return totalBudget;
  }

  static getBudgetSpend() {
    return useEncounter().monsterGroups.reduce((acc, group) => {
      let count = group.count;
      if (group.monster.isMinion) {
        count = Math.round(Math.max(1, count / group.monster.cr.minionNum));
      }
      return acc + (group.monster.cr.numeric * count);
    }, 0);
  }

  static getSecondaryMeasurements() {
    const budgetSpend = this.getBudgetSpend();
    const encounterDailyPoints = this.getEncounterDailyPoints();
    return [
      {
        label: "CR Spent",
        rawValue: budgetSpend,
        value: helpers.formatNumber(budgetSpend) +
          ' (' +
          helpers.formatNumber(
            Math.round(
              budgetSpend / useParty().totalPlayersToGainXP
            )
          ) +
          '/player)',
      },
      {
        label: "Daily Encounter Points Cost",
        rawValue: encounterDailyPoints,
        value: encounterDailyPoints
      }
    ].filter(x => x.rawValue > 0);
  }

  static getDifficultyFeel() {

    if (!useParty().totalPlayersToGainXP) {
      return "";
    }

    const budgetSpend = this.getBudgetSpend();

    const levels = Object.entries(this.getBudget());
    levels.pop();

    for (let i = 1; i < levels.length; i++) {
      const [lowerKey, lowerValue] = levels[i - 1];
      const [upperKey, upperValue] = levels[i];
      const ratio = helpers.ratio(lowerValue, upperValue, budgetSpend);

      if (ratio >= 10) {
        return "... insane?";
      }

      if (upperKey === "Hard" && ratio > 1.0) {
        if (ratio >= 1.5) {
          return ratio >= 3.0
            ? "like " +
            helpers.randomArrayElement(this.insaneDifficultyStrings)
            : ratio >= 2.0
              ? "really deadly"
              : "deadly";
        }
        return upperKey;
      } else if (ratio >= 0.0 && ratio <= 1.0) {
        if (ratio > 0.7) {
          return upperKey;
        }
        return lowerKey;
      }
    }

    const ratio = helpers.ratio(0, levels[0][1], budgetSpend);
    return ratio > 0.5 ? "like a nuisance" : "like a minor nuisance";

  }

  static getEncounterDailyPoints() {

    const budget = this.getBudget();

    if (!budget) {
      return 0;
    }

    const budgetSpend = this.getBudgetSpend();

    if (budgetSpend === 0 || budgetSpend < budget["Easy"]) return 0;
    if (budgetSpend <= budget["Standard"]) return 1;
    if (budgetSpend < budget["Hard"]) return 2;

    const ratio = helpers.ratio(budget["Standard"], budget["Hard"], budgetSpend);

    if (budgetSpend >= budget["Hard"] && ratio < 2.0) return 4;

    return 8;

  }

  static getActualDifficulty() {

    const budget = this.getBudget();

    if (!budget) {
      return "N/A";
    }

    const budgetSpend = this.getBudgetSpend();

    if (budgetSpend === 0) return "None";
    if (budgetSpend < budget["Easy"]) return "Trivial";
    if (budgetSpend < budget["Standard"]) return "Easy";
    if (budgetSpend < budget["Hard"]) return "Standard";

    return "Hard";

  }

  static generateEncounter(difficulty, encounterType) {

    let crCaps = [];
    let totalCrBudget = 0;
    for (const group of useParty().groups) {
      const groupCrTable = this.encounterCrPerCharacter[group.level];
      crCaps.push(groupCrTable.cap);
      totalCrBudget += group.players * groupCrTable[difficulty];
    }

    let crCap = crCaps.reduce((acc, val) => acc + val, 0) / crCaps.length;
    const totalPlayers = useParty().totalPlayers;

    // If this is a boss encounter, prioritize solo monsters, and adjust the CR target
    if (encounterType === CONST.ENCOUNTER_TYPES.boss.key) {
      const isLargeGroup = Number(totalPlayers >= 6);
      const bossEncounterCrModifier = this.bossEncounterCrModifiers[isLargeGroup][difficulty];
      totalCrBudget = crCap - helpers.randomIntBetween(...bossEncounterCrModifier.split("-"));
    }

    const maxNumberMinions =
      helpers.randomIntBetween(Math.max(3, totalPlayers - 1) * 3, Math.max(4, totalPlayers + 1) * 3);

    let encounterTemplate = this.getEncounterTemplate(encounterType);
    encounterTemplate.groups.reverse();

    const newEncounter = [];
    for (const groupTemplate of encounterTemplate.groups) {

      let targetCr = encounterTemplate.subtractive
        ? totalCrBudget / encounterTemplate.groups.length
        : totalCrBudget * groupTemplate.ratio;

      targetCr /= groupTemplate.count;

      targetCr = Math.min(targetCr, crCap);

      const foundMonster = this.getBestMonster(targetCr, newEncounter, groupTemplate, encounterType);

      if (!foundMonster) {
        useNotifications().notify({
          title: "Failed to generate encounter!",
          body: "Change the filters so that there are more monsters to sample from.",
          icon: "fa-circle-xmark",
          icon_color: "text-red-400",
          sticky: true,
        });
        return false;
      }

      const monster = foundMonster.copy();

      let count = groupTemplate.count;
      if (monster.isMinion) {
        monster.name += " (Minion)"
        count = Math.min(monster.cr.minionNum * count, maxNumberMinions);
      }

      newEncounter.push({ monster, count });

    }

    newEncounter.reverse();

    return newEncounter;

  }

  static monsterFilter(monster, groupTemplate, encounter, encounterType) {
    const allowMinions = [
      CONST.ENCOUNTER_TYPES.boss_minions.key,
      CONST.ENCOUNTER_TYPES.horde.key,
      CONST.ENCOUNTER_TYPES.horde.key
    ].includes(encounterType);
    return super.monsterFilter(monster, groupTemplate, encounter, encounterType) &&
      (allowMinions ? true : !monster.isMinion) &&
      (encounterType === CONST.ENCOUNTER_TYPES.boss.key ? monster.isSolo : true)
  }

  static pickRandomMonster(monsterList, groupTemplate, encounterType) {
    if (encounterType === CONST.ENCOUNTER_TYPES.boss_minions.key && groupTemplate?.leader) {
      return super.pickRandomMonster(monsterList);
    }
    const numMonsters = monsterList.length + 1;
    const weightedMonsters = monsterList.map((monster, index) => {
      return { monster, weight: (index / numMonsters) + ((monster.isLeader ? 2 : 1) / numMonsters) }
    });
    const randomFloat = Math.random();
    for (const weightedMonster of weightedMonsters) {
      if (weightedMonster.weight >= randomFloat) {
        return weightedMonster.monster;
      }
    }
  }

  static getBestMonster(targetCr, encounter, groupTemplate, encounterType) {

    let monsterCRIndex;
    for (let i = 0; i < CONST.CR.LIST.length; i++) {
      const lowerBound = CONST.CR[CONST.CR.LIST[i]];
      const upperBound = CONST.CR[CONST.CR.LIST[i + 1]];
      if (upperBound.numeric > targetCr) {
        monsterCRIndex =
          (targetCr - lowerBound.numeric) < (upperBound.numeric - targetCr) ? i : i + 1;
        break;
      }
    }

    return this.getMonstersFromCR(monsterCRIndex, encounter, groupTemplate, encounterType);

  }

  static getMultiplier(encounter) {

    const numMonsters = encounter.reduce((acc, group) => {
      let count = group.count;
      // Divide the CR cost of a minion by the number of minions
      if (group.monster.isMinion) {
        count /= group.monster.cr.minionNum;
      }
      return acc + count;
    }, 0);

    let multiplierCategory;
    const multipliers = [0.2, 0.4, 0.8, 1, 1.2, 1.4, 1.7, 2];

    if (numMonsters <= 3) {
      multiplierCategory = Math.max(1, numMonsters);
    } else if (numMonsters < 7) {
      multiplierCategory = 3;
    } else if (numMonsters < 11) {
      multiplierCategory = 4;
    } else if (numMonsters < 15) {
      multiplierCategory = 5;
    } else {
      multiplierCategory = 6;
    }

    if (useParty().totalPlayers < 3) {
      multiplierCategory++;
    } else if (useParty().totalPlayers > 5) {
      multiplierCategory--;
    }

    return multipliers[multiplierCategory];
  }

  static getNewMonster(monsterGroup, encounter) {
    const monsterList = useMonsters().filterBy(
      useFilters().overriddenCopy({
        maxCr: monsterGroup.monster.cr.numeric,
        minCr: monsterGroup.monster.cr.numeric,
      }),
      (monster) => {
        return !encounter.some((group) => group.monster.slug === monster.slug);
      }
    );
    if (!monsterList.length) return;
    const newMonster = helpers.randomArrayElement(monsterList);
    if (!newMonster) return;
    const monster = newMonster.copy();
    if (monster.isMinion) {
      monster.name += " (Minion)"
    }
    return monster;
  }

}

export default {
  [KFC.key]: KFC,
  [MCDM.key]: MCDM
}


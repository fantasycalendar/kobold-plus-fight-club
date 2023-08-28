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
    "the DM's revenge for that missed crit.",
    "accidentally crashing a dragon's private spa day.",
    "a masterclass in \"How Not to Survive.\"",
    "the gods will want popcorn to watch this disaster.",
    "the universe is asking, \"Are you sure about this?\"",
    "the DM drew a \"TPK\" card from their deck of many things.",
    "a plot twist written by Murphy's Law.",
    "something from the \"Cruel and Unusual\" rulebook.",
    "the DM is an amateur horror movie director.",
  ];

  static getTotalExp() {
    return useEncounter().monsterGroups.reduce((acc, group) => {
      return acc + group.monster.experience * group.count;
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
        group.count =
          parts.length > 1 ? helpers.randomIntBetween(...parts) : parts[0];
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
    return (
      !encounter.some((group) => group.monster.slug === monster.slug) &&
      !(groupTemplate.count > 1 && monster.isUnique)
    );
  }

  static pickRandomMonster(monsterList) {
    return helpers.randomArrayElement(monsterList);
  }

  static getMonstersFromCR(
    monsterCRIndex,
    encounter,
    groupTemplate,
    encounterType,
    additionalFilters = () => true
  ) {
    const monsterTargetCR = CONST.CR[CONST.CR.LIST[monsterCRIndex]];

    const monsters = useMonsters();

    let monsterList = monsters.filterBy(
      useFilters().overriddenCopy({
        minCr: monsterTargetCR.numeric,
        maxCr: monsterTargetCR.numeric,
      }),
      (monster) =>
        this.monsterFilter(monster, groupTemplate, encounter, encounterType) &&
        additionalFilters(monster)
    );

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
        (monster) =>
          this.monsterFilter(
            monster,
            groupTemplate,
            encounter,
            encounterType
          ) && additionalFilters(monster)
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
  static key = "k+fc";
  static label = "Classic Kobold+ Fight Club";
  static description =
    "The encounter generation strategy you know and love from Kobold+ Fight Club. It calculates the experience target appropriate for the party on the selected difficulty, picks a random encounter template, tries to fill that template with CR appropriate monsters.";
  static difficulties = [
    { key: "easy", label: "Easy" },
    { key: "medium", label: "Medium" },
    { key: "hard", label: "Hard" },
    { key: "deadly", label: "Deadly" },
  ];
  static defaultDifficulty = "medium";
  static tableHeader = "XP Goals";
  static measurementUnit = "XP";

  static #getGroupBudget(acc, group) {
    const groupExp = CONST.EXP[group.level];
    return {
      Easy: (acc?.["Easy"] ?? 0) + groupExp.easy * (group?.players ?? 1),
      Medium: (acc?.["Medium"] ?? 0) + groupExp.medium * (group?.players ?? 1),
      Hard: (acc?.["Hard"] ?? 0) + groupExp.hard * (group?.players ?? 1),
      Deadly: (acc?.["Deadly"] ?? 0) + groupExp.deadly * (group?.players ?? 1),
      "Daily budget":
        (acc?.["Daily budget"] ?? 0) + groupExp.daily * (group?.players ?? 1),
    };
  }

  static getBudget() {
    if (!useParty().totalPlayers) {
      return {};
    }
    const experience = useParty().groups.reduce(
      this.#getGroupBudget.bind(this),
      {}
    );
    return useParty().activePlayers.reduce(
      this.#getGroupBudget.bind(this),
      experience
    );
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

      if (upperKey === "daily" && ratio >= 0.0) {
        if (ratio >= 0.2) {
          return ratio >= 1.0
            ? "like " + helpers.randomArrayElement(this.insaneDifficultyStrings)
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
    const multiplier = this.getMultiplier(useEncounter().monsterGroups);
    return Math.floor(this.getTotalExp() * multiplier);
  }

  static getSecondaryMeasurements() {
    const adjustedExp = this.getAdjustedExp();
    return [
      {
        label: "Adjusted XP",
        rawValue: adjustedExp,
        value:
          helpers.formatNumber(adjustedExp) +
          " (" +
          helpers.formatNumber(
            Math.round(adjustedExp / useParty().totalPlayersToGainXP)
          ) +
          "/player)",
      },
    ].filter((x) => x.rawValue > 0);
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
      baseExpBudget / this.getMultiplier(encounterTemplate.groups);

    encounterTemplate.groups.reverse();

    let totalRatioSoFar = 0;
    const newEncounter = [];
    for (const groupTemplate of encounterTemplate.groups) {
      let groupRatio =
        typeof groupTemplate.ratio === "string"
          ? helpers.randomFloatBetween(...groupTemplate.ratio.split("-"))
          : groupTemplate?.ratio;

      if (!groupRatio) {
        groupRatio = 1.0 - totalRatioSoFar;
      }

      totalRatioSoFar += groupRatio;

      let targetExp = encounterTemplate.subtractive
        ? totalAvailableXP / encounterTemplate.groups.length
        : totalAvailableXP * groupRatio;

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

    newEncounter.sort((a, b) => {
      if (a.monster.unique && !b.monster.unique) {
        return -1;
      }
      if (!a.monster.unique && b.monster.unique) {
        return 1;
      }
      return b.monster.cr.numeric - a.monster.cr.numeric;
    });

    return newEncounter;
  }

  static getBestMonster(targetExp, encounter, groupTemplate) {
    let monsterCRIndex;
    for (let i = 0; i < CONST.CR.LIST.length - 2; i++) {
      const lowerBound = CONST.CR[CONST.CR.LIST[i]];
      const upperBound = CONST.CR[CONST.CR.LIST[i + 1]];
      if (upperBound.exp > targetExp) {
        monsterCRIndex =
          targetExp - lowerBound.exp < upperBound.exp - targetExp ? i : i + 1;
        break;
      }
    }

    if (monsterCRIndex === undefined) return false;

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
  static key = "mcdm";
  static label = "MCDM's Flee, Mortals!";
  static description = `MCDM's book, <strong>Flee, Mortals!</strong> contains a set of rules for generating encounters, specialized for the book's monsters. It works similar to the classic K+FC strategy, but each character and their level contribute to a total CR budget, instead of relying on XP. You can read more about this on page 16 in the book.`;
  static url =
    "https://shop.mcdmproductions.com/collections/flee-mortals-the-mcdm-monster-book";
  static difficulties = [
    { key: "easy", label: "Easy" },
    { key: "standard", label: "Standard" },
    { key: "hard", label: "Hard" },
  ];
  static defaultDifficulty = "standard";
  static measurementUnit = "CR";

  static tableHeader = "CR Budget";

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
  };

  static bossEncounterCrModifiers = [
    { easy: "5-6", standard: "3-4", hard: "0-2" },
    { easy: "4-5", standard: "2-3", hard: "0-1" },
  ];

  static getBudget() {
    let totalPlayers = useParty().totalPlayers;
    if (!totalPlayers) {
      return {};
    }

    let totalLevels =
      useParty().groups.reduce(
        (acc, group) => acc + group.level * group.players,
        0
      ) +
      useParty().activePlayers.reduce((acc, player) => acc + player.level, 0);

    let averageLevel = Math.floor(totalLevels / totalPlayers);

    let crBudget = this.encounterCrPerCharacter[averageLevel];

    return {
      "Easy": crBudget.easy * totalPlayers,
      "Standard": crBudget.standard * totalPlayers,
      "Hard": crBudget.hard * totalPlayers,
      "One Monster Cap": crBudget.cap
    };
  }

  static getBudgetSpend(encounter) {
    return encounter.reduce((acc, group) => {
      let count = group.count;
      if (group.monster.isMinion) {
        count = Math.round(Math.max(1, count / group.monster.cr.minionNum));
      }
      return acc + group.monster.cr.numeric * count;
    }, 0);
  }

  static getSecondaryMeasurements() {
    const budgetSpend = this.getBudgetSpend(useEncounter().monsterGroups);
    const encounterDailyPoints = this.getEncounterDailyPoints();
    return [
      {
        label: "CR Spent",
        rawValue: budgetSpend,
        value: helpers.formatNumber(budgetSpend),
      },
      {
        label: "Daily Encounter Points Cost",
        rawValue: encounterDailyPoints,
        value: encounterDailyPoints,
      },
    ].filter((x) => x.rawValue > 0);
  }

  static getDifficultyFeel() {
    if (!useParty().totalPlayersToGainXP) {
      return "";
    }

    const budgetSpend = this.getBudgetSpend(useEncounter().monsterGroups);

    if (!budgetSpend) return false;

    const levels = Object.entries(this.getBudget());
    levels.pop();

    for (let i = 1; i < levels.length; i++) {
      const [lowerKey, lowerValue] = levels[i - 1];
      const [upperKey, upperValue] = levels[i];
      const ratio = helpers.ratio(lowerValue, upperValue, budgetSpend);
      if (lowerValue === upperValue) continue;

      if (upperKey === "Hard" && ratio > 1.0) {
        if (ratio >= 1.5) {
          return ratio >= 3.0
            ? "like " + helpers.randomArrayElement(this.insaneDifficultyStrings)
            : ratio >= 2.0
            ? "really deadly"
            : "deadly";
        }
        return upperKey.toLowerCase();
      } else if (ratio >= 0.0 && ratio <= 1.0) {
        if (ratio >= 0.6) {
          return upperKey.toLowerCase();
        } else if (ratio >= 0.4) {
          return "slightly " + upperKey.toLowerCase();
        }
        return lowerKey.toLowerCase();
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

    const budgetSpend = this.getBudgetSpend(useEncounter().monsterGroups);

    if (budgetSpend === 0 || budgetSpend < budget["Easy"]) return 0;
    if (budgetSpend <= budget["Standard"]) return 1;
    if (budgetSpend < budget["Hard"]) return 2;

    const ratio = helpers.ratio(
      budget["Standard"],
      budget["Hard"],
      budgetSpend
    );

    if (budgetSpend >= budget["Hard"] && ratio < 2.0) return 4;

    return 8;
  }

  static getActualDifficulty() {
    const budget = this.getBudget();

    if (!budget) {
      return "N/A";
    }

    const budgetSpend = this.getBudgetSpend(useEncounter().monsterGroups);

    if (budgetSpend === 0) return "None";
    if (budgetSpend < budget["Easy"]) return "Trivial";
    if (budgetSpend < budget["Standard"]) return "Easy";
    if (budgetSpend < budget["Hard"]) return "Standard";

    return "Hard";
  }

  static generateEncounter(difficulty, encounterType, retrying = false) {
    let crCaps = [];
    let totalCrBudget = 0;
    for (const group of useParty().groups) {
      const groupCrTable = this.encounterCrPerCharacter[group.level];
      crCaps.push(groupCrTable.cap);
      totalCrBudget += group.players * groupCrTable[difficulty];
    }

    for (const character of useParty().activePlayers) {
      const characterCrTable = this.encounterCrPerCharacter[character.level];
      crCaps.push(characterCrTable.cap);
      totalCrBudget += characterCrTable[difficulty];
    }

    let crCap = crCaps.reduce((acc, val) => acc + val, 0) / crCaps.length;
    const totalPlayers = useParty().totalPlayers;

    // If this is a boss encounter, prioritize solo monsters, and adjust the CR target
    if (encounterType === CONST.ENCOUNTER_TYPES.boss.key) {
      const isLargeGroup = Number(totalPlayers >= 6);
      const bossEncounterCrModifier =
        this.bossEncounterCrModifiers[isLargeGroup][difficulty];
      totalCrBudget =
        crCap - helpers.randomIntBetween(...bossEncounterCrModifier.split("-"));
    }

    const maxNumberMinions = helpers.randomIntBetween(
      Math.max(3, totalPlayers - 1) * 3,
      Math.max(4, totalPlayers + 1) * 3
    );

    let encounterTemplate = this.getEncounterTemplate(encounterType);

    let totalRatioSoFar = 0;
    encounterTemplate.groups = encounterTemplate.groups.map((groupTemplate) => {
      let groupRatio =
        typeof groupTemplate.ratio === "string"
          ? helpers.randomFloatBetween(...groupTemplate.ratio.split("-"))
          : groupTemplate?.ratio;
      if (!groupRatio) {
        groupRatio = 1.0 - totalRatioSoFar;
      }
      totalRatioSoFar += groupRatio;
      groupTemplate.ratio = groupRatio;
      return groupTemplate;
    });

    encounterTemplate.groups.reverse();

    const newEncounter = [];
    for (const groupTemplate of encounterTemplate.groups) {
      let targetCr = encounterTemplate.subtractive
        ? totalCrBudget / encounterTemplate.groups.length
        : totalCrBudget * groupTemplate.ratio;

      targetCr /= groupTemplate.count;

      targetCr = Math.min(targetCr, crCap);

      const foundMonster = this.getBestMonster(
        targetCr,
        newEncounter,
        groupTemplate,
        encounterType
      );

      if (!foundMonster) {
        // If we failed to find a monster, perhaps we need to try a different encounter template, hopefully working eventually
        if (!retrying) {
          let retriedEncounter = false;
          let attempts = 0;
          while (!retriedEncounter && attempts < 10) {
            attempts++;
            retriedEncounter = this.generateEncounter(
              difficulty,
              encounterType,
              true
            );
            if (retriedEncounter) return retriedEncounter;
          }
          useNotifications().notify({
            title: "Failed to generate encounter!",
            body: "Change the filters so that there are more monsters to sample from.",
            icon: "fa-circle-xmark",
            icon_color: "text-red-400",
            sticky: true,
          });
        }
        return false;
      }

      const monster = foundMonster.copy();
      let count = groupTemplate.count;
      if (monster.isMinion) {
        monster.name += " (Minion)";
        count = Math.min(monster.cr.minionNum * count, maxNumberMinions);
      }
      newEncounter.push({ monster, count, baseCount: groupTemplate.count });
    }

    // If we have any leftover budget, we add a monster to pad it out
    let totalGeneratedCr = this.getBudgetSpend(newEncounter);
    if (totalCrBudget > totalGeneratedCr * 1.1) {
      let foundMonster;
      let attempts = 0;
      while (!foundMonster && attempts < 10) {
        attempts++;
        const leftOverCr = totalCrBudget - totalGeneratedCr;
        const totalMonsters = helpers.randomIntBetween(
          1,
          Math.max(1, leftOverCr)
        );
        const crPerMonster = leftOverCr / totalMonsters;
        foundMonster = this.getBestMonster(
          crPerMonster,
          newEncounter,
          { count: totalMonsters },
          encounterType,
          (monster) => {
            return !monster.isMinion;
          }
        );
        if (foundMonster) {
          const monster = foundMonster.copy();
          let count = totalMonsters;
          if (monster.isMinion) {
            monster.name += " (Minion)";
            count = Math.min(monster.cr.minionNum * count, maxNumberMinions);
          }
          newEncounter.push({ monster, count });
          break;
        }
      }
    }

    newEncounter.sort((a, b) => {
      if (a.monster.unique && !b.monster.unique) {
        return -1;
      }
      if (!a.monster.unique && b.monster.unique) {
        return 1;
      }
      return b.monster.cr.numeric - a.monster.cr.numeric;
    });

    return newEncounter;
  }

  static monsterFilter(monster, groupTemplate, encounter, encounterType) {
    const allowMinions = [
      CONST.ENCOUNTER_TYPES.boss_minions.key,
      CONST.ENCOUNTER_TYPES.horde.key,
      CONST.ENCOUNTER_TYPES.horde.key,
    ].includes(encounterType);
    return (
      super.monsterFilter(monster, groupTemplate, encounter, encounterType) &&
      (allowMinions ? true : !monster.isMinion) &&
      (encounterType === CONST.ENCOUNTER_TYPES.boss.key ? monster.isSolo : true)
    );
  }

  static pickRandomMonster(monsterList, groupTemplate, encounterType) {
    if (
      encounterType === CONST.ENCOUNTER_TYPES.boss_minions.key &&
      !groupTemplate?.leader
    ) {
      return super.pickRandomMonster(monsterList);
    }
    const numMonsters = monsterList.length + 1;
    const weightedMonsters = monsterList.map((monster, index) => {
      return {
        monster,
        weight: index / numMonsters + (monster.isLeader ? 2 : 1) / numMonsters,
      };
    });
    const randomFloat = Math.random();
    for (const weightedMonster of weightedMonsters) {
      if (weightedMonster.weight >= randomFloat) {
        return weightedMonster.monster;
      }
    }
  }

  static getBestMonster(
    targetCr,
    encounter,
    groupTemplate,
    encounterType,
    additionalFilters
  ) {
    let monsterCRIndex;
    for (let i = 0; i < CONST.CR.LIST.length - 2; i++) {
      const lowerBound = CONST.CR[CONST.CR.LIST[i]].numeric;
      const upperBound = CONST.CR[CONST.CR.LIST[i + 1]].numeric;
      if (upperBound > targetCr) {
        monsterCRIndex =
          Math.max(0, targetCr - lowerBound) < upperBound - targetCr
            ? i
            : i + 1;
        break;
      }
    }

    if (monsterCRIndex === undefined) return false;

    return this.getMonstersFromCR(
      monsterCRIndex,
      encounter,
      groupTemplate,
      encounterType,
      additionalFilters
    );
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
      monster.name += " (Minion)";
    }
    return monster;
  }
}

export default {
  [KFC.key]: KFC,
  [MCDM.key]: MCDM,
};

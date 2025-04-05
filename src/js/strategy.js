import { useNotifications } from "../stores/notifications.js";
import { useMonsters } from "../stores/monsters.js";
import CONST from "./constants.js";
import { useFilters } from "../stores/filters.js";
import * as helpers from "./helpers.js";
import { useParty } from "../stores/party.js";
import { useEncounter } from "../stores/encounter.js";
import { clamp } from "./helpers.js";

class EncounterStrategy {

	static fudge_factor = 1.1;

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

	static encounterExpPerCharacter = {};
	static difficulties = [];

	static getGroupBudget(acc, group) {
		const groupExp = this.encounterExpPerCharacter[Math.floor(group.level)];
		for(const difficulty of this.difficulties){
			acc[difficulty.key] ??= 0;
			acc[difficulty.key] += groupExp[difficulty.key] * (group?.players ?? 1);
		}
		return acc;
	}

  static getTotalExp() {
    return useEncounter().monsterGroups.reduce((acc, group) => {
      return acc + group.monster.experience * group.count;
    }, 0);
  }

	static getBudget() {
		if (!useParty().totalPlayers) {
			return {};
		}
		const experience = useParty().groups.reduce(
			this.getGroupBudget.bind(this),
			{}
		);
		return useParty().activePlayers.reduce(
			this.getGroupBudget.bind(this),
			experience
		);
	}

  static getEncounterTemplate(encounterType) {
    let template = helpers.clone(CONST.ENCOUNTER_TYPES[encounterType]);
    template = helpers.randomArrayElement(template.samples);

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
  static label = "D&D5e 2014 Encounter Rules";
  static description =
    "The encounter generation strategy you know and love from Kobold+ Fight Club. It calculates the experience target appropriate for the party on the selected difficulty, picks a random encounter template, tries to fill that template with CR appropriate monsters.";
  static difficulties = [
	  { key: "easy", label: "Easy" },
	  { key: "medium", label: "Medium" },
	  { key: "hard", label: "Hard" },
	  { key: "deadly", label: "Deadly" },
	  { key: "daily", label: "Daily Experience", hidden: true },
  ];
  static defaultDifficulty = "medium";
  static tableHeader = "XP Goals";
  static measurementUnit = "XP";
	static encounterExpPerCharacter = {
		1: { daily: 300, easy: 25, medium: 50, hard: 75, deadly: 100 },
		2: { daily: 600, easy: 50, medium: 100, hard: 150, deadly: 200 },
		3: { daily: 1200, easy: 75, medium: 150, hard: 225, deadly: 400 },
		4: { daily: 1700, easy: 125, medium: 250, hard: 375, deadly: 500 },
		5: { daily: 3500, easy: 250, medium: 500, hard: 750, deadly: 1100 },
		6: { daily: 4000, easy: 300, medium: 600, hard: 900, deadly: 1400 },
		7: { daily: 5000, easy: 350, medium: 750, hard: 1100, deadly: 1700 },
		8: { daily: 6000, easy: 450, medium: 900, hard: 1400, deadly: 2100 },
		9: { daily: 7500, easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
		10: { daily: 9000, easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
		11: { daily: 10500, easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
		12: { daily: 11500, easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
		13: { daily: 13500, easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
		14: { daily: 15000, easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
		15: { daily: 18000, easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
		16: { daily: 20000, easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
		17: { daily: 25000, easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
		18: { daily: 27000, easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
		19: { daily: 30000, easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
		20: { daily: 40000, easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
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
    const adjustedExp = this.getAdjustedExp();
    const budget = this.getBudget();
    return this.getDifficultyFromCr({ exp: adjustedExp }, budget)
  }

  static getDifficultyFromCr(cr, budget){
    if (!budget) {
      return "N/A";
    }

    if (cr.exp === 0) return "None";
    if (cr.exp < budget["easy"]) return "Trivial";
    if (cr.exp < budget["medium"]) return "Easy";
    if (cr.exp < budget["hard"]) return "Medium";
    if (cr.exp < budget["deadly"]) return "Hard";

    return "Deadly";
  }

  static generateEncounter(difficulty, encounterType) {

    const totalExperienceTarget = useParty().experience[difficulty];

    if (!totalExperienceTarget) return;

    let baseExpBudget = totalExperienceTarget * this.fudge_factor;
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

      let targetExp = totalAvailableXP * groupRatio;

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
	  { key: "cap", label: "One Monster Cap", hidden: true },
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
        (acc, group) => acc + Math.floor(group.level) * Math.floor(group.players),
        0
      ) +
      useParty().activePlayers.reduce((acc, player) => acc + Math.floor(player.level), 0);

    let averageLevel = helpers.clamp(Math.round(totalLevels / totalPlayers), 1, 20);

    let crBudget = this.encounterCrPerCharacter[averageLevel];

    return {
      "easy": crBudget.easy * totalPlayers,
      "standard": crBudget.standard * totalPlayers,
      "hard": crBudget.hard * totalPlayers,
      "cap": crBudget.cap
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

      if (upperKey === "hard" && ratio > 1.0) {
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
    if (budgetSpend <= budget["standard"]) return 1;
    if (budgetSpend < budget["hard"]) return 2;

    const ratio = helpers.ratio(
      budget["standard"],
      budget["hard"],
      budgetSpend
    );

    if (budgetSpend >= budget["hard"] && ratio < 2.0) return 4;

    return 8;
  }

  static getActualDifficulty() {
    const budgetSpend = this.getBudgetSpend(useEncounter().monsterGroups);
    const budget = this.getBudget();
    return this.getDifficultyFromCr({ numeric: budgetSpend }, budget);
  }

  static getDifficultyFromCr(cr, budget){
    if (!budget) {
      return "N/A";
    }

    if (cr.numeric === 0) return "None";
    if (cr.numeric < budget["Easy"]) return "Trivial";
    if (cr.numeric < budget["standard"]) return "Easy";
    if (cr.numeric < budget["hard"]) return "Standard";

    return "Hard";
  }

  static generateEncounter(difficulty, encounterType, retrying = false) {

    let crCaps = [];
    let totalCrBudget = 0;
    for (const group of useParty().groups) {
      const groupCrTable = this.encounterCrPerCharacter[Math.floor(group.level)];
      crCaps.push(groupCrTable.cap);
      totalCrBudget += Math.floor(group.players) * groupCrTable[difficulty];
    }

    for (const character of useParty().activePlayers) {
      const characterCrTable = this.encounterCrPerCharacter[Math.floor(character.level)];
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
      let targetCr = (totalCrBudget * groupTemplate.ratio) / groupTemplate.count;

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

class DnD2024 extends KFC {

  static key = "dnd2024";
  static label = "D&D5e 2024 Encounter Rules";
  static description = "The same behavior as the classic K+FC encounter generation, but fit for the 2024 rules.";
  static url = "https://www.dndbeyond.com/sources/dnd/free-rules/combat";
  static difficulties = [
	  { key: "low", label: "Low" },
	  { key: "moderate", label: "Moderate" },
	  { key: "high", label: "High" },
  ];
  static defaultDifficulty = "moderate";
  static tableHeader = "XP Goals";
  static measurementUnit = "XP";
	static fudge_factor = 1.15;

	static encounterExpPerCharacter = {
		1: { low: 50, moderate: 75, high: 100 },
		2: { low: 100, moderate: 150, high: 200 },
		3: { low: 150, moderate: 225, high: 400 },
		4: { low: 250, moderate: 375, high: 500 },
		5: { low: 500, moderate: 750, high: 1100 },
		6: { low: 600, moderate: 1000, high: 1400 },
		7: { low: 750, moderate: 1300, high: 1700 },
		8: { low: 1000, moderate: 1700, high: 2100 },
		9: { low: 1300, moderate: 2000, high: 2600 },
		10: { low: 1600, moderate: 2300, high: 3100 },
		11: { low: 1900, moderate: 2900, high: 4100 },
		12: { low: 2200, moderate: 3700, high: 4700 },
		13: { low: 2600, moderate: 4200, high: 5400 },
		14: { low: 2900, moderate: 4900, high: 6200 },
		15: { low: 3300, moderate: 5400, high: 7800 },
		16: { low: 3800, moderate: 6100, high: 9800 },
		17: { low: 4500, moderate: 7200, high: 11700 },
		18: { low: 5000, moderate: 8700, high: 14200 },
		19: { low: 5500, moderate: 10700, high: 17200 },
		20: { low: 6400, moderate: 13200, high: 22000 }
	};

  static getDifficultyFeel() {
    if (!useParty().totalPlayersToGainXP) {
      return "";
    }

    const experience = this.getTotalExp();

    if (experience === 0) return "";

    const levels = Object.entries(useParty().experience);
    for (let i = 1; i < levels.length; i++) {
      const [lowerKey, lowerValue] = levels[i - 1];
      const [upperKey, upperValue] = levels[i];
      const ratio = helpers.ratio(lowerValue, upperValue, experience);

      if (i === levels.length-1 && ratio >= 1) {
        if (ratio >= 2.0) {
          return ratio >= 3.0
            ? "like " + helpers.randomArrayElement(this.insaneDifficultyStrings)
            : ratio >= 2.5
              ? "extremely deadly"
              : "really deadly";
        } else if (ratio >= 1.5) {
	        return "deadly";
        }
	      return upperKey;
      } else if (ratio >= 0.0 && ratio <= 1.0) {
        if (ratio >= 0.6) {
          return "like " + upperKey;
        }
        return lowerKey;
      }
    }

    const ratio = helpers.ratio(0, levels[0][1], experience);
    return ratio > 0.5 ? "like a nuisance" : "like a minor nuisance";
  }

  static getDifficultyFromCr(cr, budget){
    if (!budget) {
      return "N/A";
    }

    if (cr.exp === 0) return "None";
    if (cr.exp < budget["low"]) return "Trivial";
    if (cr.exp < budget["moderate"]) return "Low";
    if (cr.exp < budget["high"]) return "Moderate";
    if (cr.exp < budget["high"] * 1.5) return "High";

    return "Deadly";
  }

  static getSecondaryMeasurements() {
    return [];
  }

  static getMultiplier() {
    return 1.0;
  }

  static getAdjustedExp() {
    return this.getTotalExp();
  }

}

export default {
	[DnD2024.key]: DnD2024,
	[KFC.key]: KFC,
  [MCDM.key]: MCDM,
};

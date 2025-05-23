const CONST = {

  CR: {
    LIST: [
      "0",
      "1/8",
      "1/4",
      "1/2",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
    ],
    0: { string: "0", numeric: 0, exp: 10, minionNum: 5, minionExp: 2 },
    "1/8": { string: "1/8", numeric: 0.125, exp: 25, minionNum: 5, minionExp: 5 },
    "1/4": { string: "1/4", numeric: 0.25, exp: 50, minionNum: 5, minionExp: 10 },
    "1/2": { string: "1/2", numeric: 0.5, exp: 100, minionNum: 5, minionExp: 20 },
    1: { string: "1", numeric: 1, exp: 200, minionNum: 5, minionExp: 40 },
    2: { string: "2", numeric: 2, exp: 450, minionNum: 5, minionExp: 90 },
    3: { string: "3", numeric: 3, exp: 700, minionNum: 5, minionExp: 140 },
    4: { string: "4", numeric: 4, exp: 1100, minionNum: 5, minionExp: 220 },
    5: { string: "5", numeric: 5, exp: 1800, minionNum: 8, minionExp: 225 },
    6: { string: "6", numeric: 6, exp: 2300, minionNum: 8, minionExp: 285 },
    7: { string: "7", numeric: 7, exp: 2900, minionNum: 8, minionExp: 360 },
    8: { string: "8", numeric: 8, exp: 3900, minionNum: 8, minionExp: 485 },
    9: { string: "9", numeric: 9, exp: 5000, minionNum: 10, minionExp: 500 },
    10: { string: "10", numeric: 10, exp: 5900, minionNum: 10, minionExp: 590 },
    11: { string: "11", numeric: 11, exp: 7200, minionNum: 10, minionExp: 720 },
    12: { string: "12", numeric: 12, exp: 8400, minionNum: 10, minionExp: 840 },
    13: { string: "13", numeric: 13, exp: 10000, minionNum: 10, minionExp: 1000 },
    14: { string: "14", numeric: 14, exp: 11500, minionNum: 10, minionExp: 1150 },
    15: { string: "15", numeric: 15, exp: 13000, minionNum: 10, minionExp: 1300 },
    16: { string: "16", numeric: 16, exp: 15000, minionNum: 10, minionExp: 1500 },
    17: { string: "17", numeric: 17, exp: 18000, minionNum: 10, minionExp: 1800 },
    18: { string: "18", numeric: 18, exp: 20000, minionNum: 10, minionExp: 2000 },
    19: { string: "19", numeric: 19, exp: 22000, minionNum: 10, minionExp: 2200 },
    20: { string: "20", numeric: 20, exp: 25000, minionNum: 10, minionExp: 2500 },
    21: { string: "21", numeric: 21, exp: 33000, minionNum: 10, minionExp: 3300 },
    22: { string: "22", numeric: 22, exp: 41000, minionNum: 10, minionExp: 4100 },
    23: { string: "23", numeric: 23, exp: 50000, minionNum: 10, minionExp: 5000 },
    24: { string: "24", numeric: 24, exp: 62000, minionNum: 10, minionExp: 6200 },
    25: { string: "25", numeric: 25, exp: 75000, minionNum: 10, minionExp: 7500 },
    26: { string: "26", numeric: 26, exp: 90000, minionNum: 10, minionExp: 9000 },
    27: { string: "27", numeric: 27, exp: 105000, minionNum: 10, minionExp: 10500 },
    28: { string: "28", numeric: 28, exp: 120000, minionNum: 10, minionExp: 12000 },
    29: { string: "29", numeric: 29, exp: 135000, minionNum: 10, minionExp: 13500 },
    30: { string: "30", numeric: 30, exp: 155000, minionNum: 10, minionExp: 15500 },
  },

  ALIGNMENTS: {
    ANY: { string: "any" },
    ANY_LAWFUL: { string: "any lawful" },
    ANY_CHAOTIC: { string: "any chaotic" },
    ANY_EVIL: { string: "any evil" },
    ANY_GOOD: { string: "any good" },
    ANY_NEUTRAL: { string: "any neutral" },
    NON_LAWFUL: { string: "non-lawful" },
    NON_CHAOTIC: { string: "non-chaotic" },
    NON_GOOD: { string: "non-good" },
    NON_EVIL: { string: "non-evil" },
    NON_NEUTRAL: { string: "non-neutral" },

    LAWFUL_GOOD: { string: "lawful good" },
    NEUTRAL_GOOD: { string: "neutral good" },
    CHAOTIC_GOOD: { string: "chaotic good" },
    LAWFUL_NEUTRAL: { string: "lawful neutral" },
    NEUTRAL: { string: "neutral" },
    CHAOTIC_NEUTRAL: { string: "chaotic neutral" },
    LAWFUL_EVIL: { string: "lawful evil" },
    NEUTRAL_EVIL: { string: "neutral evil" },
    CHAOTIC_EVIL: { string: "chaotic evil" },
    UNALIGNED: { string: "unaligned" },
  },

  LEGENDARY_MAP: {
    Legendary: "legendary",
    "Legendary (in lair)": "lair",
    Ordinary: false,
  },

  ENCOUNTER_TYPES: {
    random: {
      name: "Random",
      key: "random",
      samples: [
        { groups: [{ count: 1, ratio: 1.0 }] },
        { groups: [{ count: 1, ratio: 1 / 2 }, { count: 1, ratio: 1 / 2 }] },
        { groups: [{ count: 1, ratio: 1 / 3 }, { count: 2, ratio: 2 / 3 }] },
        { groups: [{ count: 1, ratio: 1 / 6 }, { count: 5, ratio: 5 / 6 }] },
        { groups: [{ count: 1, ratio: 1 / 3 }, { count: 1, ratio: 1 / 3 }, { count: 1, ratio: 1 / 3 }] },
        { groups: [{ count: 1, ratio: 1 / 4 }, { count: 1, ratio: 1 / 4 }, { count: 2, ratio: 2 / 4 }] },
        { groups: [{ count: 1, ratio: 1 / 5 }, { count: 1, ratio: 1 / 5 }, { count: 3, ratio: 3 / 5 }] },
        { groups: [{ count: 2, ratio: 1 / 2 }, { count: 2, ratio: 1 / 2 }] },
        { groups: [{ count: 2, ratio: 2 / 6 }, { count: 4, ratio: 4 / 6 }] },
        { groups: [{ count: 8, ratio: 1.0 }] }
      ],
    },
    boss: {
      name: "Boss",
      key: "boss",
      samples: [{ groups: [{ count: 1, ratio: 1.0 }] }],
    },
    boss_minions: {
      name: "Boss with minions",
      key: "boss_minions",
      samples: [
        {
          groups: [
            { count: 1, ratio: "0.5-0.6", leader: true },
            { count: "players-players*2" },
          ],
        },
        {
          groups: [
            { count: 1, ratio: "0.5-0.6", leader: true },
            { count: "1-3", ratio: 0.25 },
            { count: "players-players*2" },
          ],
        },
      ],
    },
    duo: {
      name: "Duo monsters",
      key: "duo",
      samples: [
        {
          groups: [
            { count: 1, ratio: 0.5 },
            { count: 1, ratio: 0.5 },
          ],
        },
        {
          groups: [
            { count: 1, ratio: 0.6 },
            { count: 1, ratio: 0.4 },
          ],
        },
      ],
    },
    trio: {
      name: "Trio of monsters",
      key: "trio",
      samples: [
        {
          groups: [
            { count: 1, ratio: 0.33 },
            { count: 1, ratio: 0.33 },
            { count: 1, ratio: 0.33 },
          ],
        },
        {
          groups: [
            { count: 1, ratio: 0.4 },
            { count: 1, ratio: 0.3 },
            { count: 1, ratio: 0.3 },
          ],
        },
        {
          groups: [
            { count: 1, ratio: 0.5 },
            { count: 1, ratio: 0.3 },
            { count: 1, ratio: 0.2 },
          ],
        },
      ],
    },
    horde: {
      name: "Horde",
      horde: "horde",
      samples: [
        {
          groups: [
            { count: "2-4", ratio: "0.25-0.35" },
            { count: "players+3-players*3", ratio: 0.2 },
            { count: "players+3-players*3" },
          ],
        },
        {
          groups: [
            { count: "2-players", ratio: "0.4-0.6" },
            { count: "players+4-players*3" },
          ],
        },
        {
          groups: [{ count: "players*3-players*5", ratio: 1 }],
        },
      ],
    },
  },
};

CONST.ALIGNMENT_TEST_ORDER = [
  CONST.ALIGNMENTS.ANY_CHAOTIC,
  CONST.ALIGNMENTS.ANY_EVIL,
  CONST.ALIGNMENTS.ANY_GOOD,
  CONST.ALIGNMENTS.ANY_LAWFUL,
  CONST.ALIGNMENTS.ANY_NEUTRAL,
  CONST.ALIGNMENTS.NON_CHAOTIC,
  CONST.ALIGNMENTS.NON_EVIL,
  CONST.ALIGNMENTS.NON_GOOD,
  CONST.ALIGNMENTS.NON_LAWFUL,
  CONST.ALIGNMENTS.UNALIGNED,
  CONST.ALIGNMENTS.LAWFUL_GOOD,
  CONST.ALIGNMENTS.NEUTRAL_GOOD,
  CONST.ALIGNMENTS.CHAOTIC_GOOD,
  CONST.ALIGNMENTS.LAWFUL_NEUTRAL,
  CONST.ALIGNMENTS.CHAOTIC_NEUTRAL,
  CONST.ALIGNMENTS.LAWFUL_EVIL,
  CONST.ALIGNMENTS.NEUTRAL_EVIL,
  CONST.ALIGNMENTS.CHAOTIC_EVIL,
  CONST.ALIGNMENTS.NEUTRAL,
  CONST.ALIGNMENTS.ANY,
];

CONST.ALIGNMENTS.LAWFUL_GOOD.bits = 1;
CONST.ALIGNMENTS.NEUTRAL_GOOD.bits = 2;
CONST.ALIGNMENTS.CHAOTIC_GOOD.bits = 4;
CONST.ALIGNMENTS.LAWFUL_NEUTRAL.bits = 8;
CONST.ALIGNMENTS.NEUTRAL.bits = 16;
CONST.ALIGNMENTS.CHAOTIC_NEUTRAL.bits = 32;
CONST.ALIGNMENTS.LAWFUL_EVIL.bits = 64;
CONST.ALIGNMENTS.NEUTRAL_EVIL.bits = 128;
CONST.ALIGNMENTS.CHAOTIC_EVIL.bits = 256;
CONST.ALIGNMENTS.UNALIGNED.bits = 512;

CONST.ALIGNMENTS.ANY.bits =
  CONST.ALIGNMENTS.LAWFUL_GOOD.bits |
  CONST.ALIGNMENTS.NEUTRAL_GOOD.bits |
  CONST.ALIGNMENTS.CHAOTIC_GOOD.bits |
  CONST.ALIGNMENTS.LAWFUL_NEUTRAL.bits |
  CONST.ALIGNMENTS.NEUTRAL.bits |
  CONST.ALIGNMENTS.CHAOTIC_NEUTRAL.bits |
  CONST.ALIGNMENTS.LAWFUL_EVIL.bits |
  CONST.ALIGNMENTS.NEUTRAL_EVIL.bits |
  CONST.ALIGNMENTS.CHAOTIC_EVIL.bits;

CONST.ALL_ALIGNMENTS =
  CONST.ALIGNMENTS.ANY.bits | CONST.ALIGNMENTS.UNALIGNED.bits;

CONST.ALIGNMENTS.ANY_LAWFUL.bits =
  CONST.ALIGNMENTS.LAWFUL_GOOD.bits |
  CONST.ALIGNMENTS.LAWFUL_NEUTRAL.bits |
  CONST.ALIGNMENTS.LAWFUL_EVIL.bits;

CONST.ALIGNMENTS.ANY_CHAOTIC.bits =
  CONST.ALIGNMENTS.CHAOTIC_GOOD.bits |
  CONST.ALIGNMENTS.CHAOTIC_NEUTRAL.bits |
  CONST.ALIGNMENTS.CHAOTIC_EVIL.bits;

CONST.ALIGNMENTS.ANY_EVIL.bits =
  CONST.ALIGNMENTS.LAWFUL_EVIL.bits |
  CONST.ALIGNMENTS.NEUTRAL_EVIL.bits |
  CONST.ALIGNMENTS.CHAOTIC_EVIL.bits;

CONST.ALIGNMENTS.ANY_GOOD.bits =
  CONST.ALIGNMENTS.LAWFUL_GOOD.bits |
  CONST.ALIGNMENTS.NEUTRAL_GOOD.bits |
  CONST.ALIGNMENTS.CHAOTIC_GOOD.bits;

CONST.ALIGNMENTS.ANY_NEUTRAL.bits =
  CONST.ALIGNMENTS.NEUTRAL_GOOD.bits |
  CONST.ALIGNMENTS.LAWFUL_NEUTRAL.bits |
  CONST.ALIGNMENTS.NEUTRAL.bits |
  CONST.ALIGNMENTS.CHAOTIC_NEUTRAL.bits |
  CONST.ALIGNMENTS.NEUTRAL_EVIL.bits;

CONST.ALIGNMENTS.NON_LAWFUL.bits =
  CONST.ALIGNMENTS.NEUTRAL_GOOD.bits |
  CONST.ALIGNMENTS.CHAOTIC_GOOD.bits |
  CONST.ALIGNMENTS.NEUTRAL.bits |
  CONST.ALIGNMENTS.CHAOTIC_NEUTRAL.bits |
  CONST.ALIGNMENTS.NEUTRAL_EVIL.bits |
  CONST.ALIGNMENTS.CHAOTIC_EVIL.bits;

CONST.ALIGNMENTS.NON_CHAOTIC.bits =
  CONST.ALIGNMENTS.LAWFUL_GOOD.bits |
  CONST.ALIGNMENTS.NEUTRAL_GOOD.bits |
  CONST.ALIGNMENTS.LAWFUL_NEUTRAL.bits |
  CONST.ALIGNMENTS.NEUTRAL.bits |
  CONST.ALIGNMENTS.LAWFUL_EVIL.bits |
  CONST.ALIGNMENTS.NEUTRAL_EVIL.bits;

CONST.ALIGNMENTS.NON_GOOD.bits =
  CONST.ALIGNMENTS.LAWFUL_NEUTRAL.bits |
  CONST.ALIGNMENTS.NEUTRAL.bits |
  CONST.ALIGNMENTS.CHAOTIC_NEUTRAL.bits |
  CONST.ALIGNMENTS.LAWFUL_EVIL.bits |
  CONST.ALIGNMENTS.NEUTRAL_EVIL.bits |
  CONST.ALIGNMENTS.CHAOTIC_EVIL.bits;

CONST.ALIGNMENTS.NON_EVIL.bits =
  CONST.ALIGNMENTS.LAWFUL_GOOD.bits |
  CONST.ALIGNMENTS.NEUTRAL_GOOD.bits |
  CONST.ALIGNMENTS.CHAOTIC_GOOD.bits |
  CONST.ALIGNMENTS.LAWFUL_NEUTRAL.bits |
  CONST.ALIGNMENTS.NEUTRAL.bits |
  CONST.ALIGNMENTS.CHAOTIC_NEUTRAL.bits;

CONST.ALIGNMENTS.NON_NEUTRAL.bits =
  CONST.ALIGNMENTS.LAWFUL_GOOD.bits |
  CONST.ALIGNMENTS.CHAOTIC_GOOD.bits |
  CONST.ALIGNMENTS.LAWFUL_EVIL.bits |
  CONST.ALIGNMENTS.CHAOTIC_EVIL.bits;

Object.keys(CONST.ALIGNMENTS).forEach(function (key) {
  CONST.ALIGNMENTS[key].regex = new RegExp(
    CONST.ALIGNMENTS[key].string.replace(/[- ]/, "[- ]?"),
    "i"
  );
});

export default CONST;

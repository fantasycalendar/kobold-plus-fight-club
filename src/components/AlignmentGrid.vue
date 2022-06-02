<template>
  <div>
    <div class="block font-medium text-gray-700 dark:text-gray-300 mb-1">
      Alignment
    </div>

    <div
      class="grid grid-cols-[12px_12px_repeat(12,_minmax(0,_1fr))] divide divide-gray-200 dark:divide-gray-600 gap-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden p-2"
    >
      <div
        @click="toggle(lawful_good | neutral | chaotic_evil)"
        :class="classes(lawful_good | neutral | chaotic_evil)"
        class="col-span-2 rounded-tl-md dark:border-gray-600"
      ></div>
      <div
        @click="toggle(lawful_good | lawful_neutral | lawful_evil)"
        :class="classes(lawful_good | lawful_neutral | lawful_evil)"
        class="col-span-4 h-8 rounded-t-md"
      >
        <i class="fa fa-gavel"></i>
      </div>
      <div
        @click="toggle(neutral_good | neutral | neutral_evil)"
        :class="classes(neutral_good | neutral | neutral_evil)"
        class="col-span-4 h-8 rounded-t-md"
      >
        <i class="fa fa-scale-balanced"></i>
      </div>
      <div
        @click="toggle(chaotic_good | chaotic_neutral | chaotic_evil)"
        :class="classes(chaotic_good | chaotic_neutral | chaotic_evil)"
        class="col-span-4 h-8 rounded-t-md"
      >
        <i :class="{[randomIcon]: true}"></i>
      </div>

      <div
        @click="toggle(lawful_good | neutral_good | chaotic_good)"
        :class="classes(lawful_good | neutral_good | chaotic_good)"
        class="col-span-2 w-8 rounded-l-md"
      >
        <i class="fa fa-dove"></i>
      </div>
      <div
        @click="toggle(lawful_good)"
        :class="classes(lawful_good)"
        class="col-span-4 h-12"
        title="Lawful Good"
      >
        LG
      </div>
      <div
        @click="toggle(neutral_good)"
        :class="classes(neutral_good)"
        class="col-span-4 h-12"
        title="Neutral Good"
      >
        NG
      </div>
      <div
        @click="toggle(chaotic_good)"
        :class="classes(chaotic_good)"
        class="col-span-4 h-12"
        title="Chaotic Good"
      >
        CG
      </div>

      <div
        @click="toggle(lawful_neutral | neutral | chaotic_neutral)"
        :class="classes(lawful_neutral | neutral | chaotic_neutral)"
        class="col-span-2 w-8 rounded-l-md"
      >
        <i class="fa fa-face-meh"></i>
      </div>
      <div
        @click="toggle(lawful_neutral)"
        :class="classes(lawful_neutral)"
        class="col-span-4 h-12"
        title="Lawful Neutral"
      >
        LN
      </div>
      <div
        @click="toggle(neutral)"
        :class="classes(neutral)"
        class="col-span-4 h-12"
        title="Neutral"
      >
        N
      </div>
      <div
        @click="toggle(chaotic_neutral)"
        :class="classes(chaotic_neutral)"
        class="col-span-4 h-12"
        title="Chaotic Neutral"
      >
        CN
      </div>

      <div
        @click="toggle(lawful_evil | neutral_evil | chaotic_evil)"
        :class="classes(lawful_evil | neutral_evil | chaotic_evil)"
        class="col-span-2 w-8 rounded-l-md"
      >
        <i class="fa fa-skull"></i>
      </div>
      <div
        @click="toggle(lawful_evil)"
        :class="classes(lawful_evil)"
        class="col-span-4 h-12"
        title="Lawful Evil"
      >
        LE
      </div>
      <div
        @click="toggle(neutral_evil)"
        :class="classes(neutral_evil)"
        class="col-span-4 h-12"
        title="Neutral Evil"
      >
        NE
      </div>
      <div
        @click="toggle(chaotic_evil)"
        :class="classes(chaotic_evil)"
        class="col-span-4 h-12"
        title="Chaotic Evil"
      >
        CE
      </div>

      <div
        @click="toggle(lawful_evil | neutral | chaotic_good)"
        :class="classes(lawful_evil | neutral | chaotic_good)"
        class="col-span-2 rounded-bl-md"
      ></div>
      <div
        @click="filters.alignment.bits = filters.alignment.bits === 1023 ? 0 : 1023"
        :class="{
          'bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-900':
            (filters.alignment.bits & 1023) === 1023,
          'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border':
            (filters.alignment.bits & 1023) !== 1023,
        }"
        class="select-none text-gray-900 col-span-6 cursor-pointer grid place-items-center h-8 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:text-white"
      >
        Any
      </div>
      <div
        @click="filters.alignment.bits = filters.alignment.bits ^ 512"
        :class="{
          'bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-900':
            (filters.alignment.bits & 512) === 512,
          'text-gray-900 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border':
            (filters.alignment.bits & 512) !== 512,
        }"
        class="select-none text-gray-900 rounded-br-md col-span-6 cursor-pointer grid place-items-center h-8 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border dark:text-white"
      >
        Unaligned
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useFilters } from "../stores/filters";

const filters = useFilters();

const lawful_good = ref(1);
const neutral_good = ref(2);
const chaotic_good = ref(4);
const lawful_neutral = ref(8);
const neutral = ref(16);
const chaotic_neutral = ref(32);
const lawful_evil = ref(64);
const neutral_evil = ref(128);
const chaotic_evil = ref(256);
const total = ref(1023);
const randomIconIndex = ref(0);
const icons = ref([
  "fa-solid fa-dumpster-fire",
  "fa-solid fa-poo-storm",
  "fa-solid fa-meteor",
  "fa-solid fa-arrows-split-up-and-left",
  "fa-solid fa-arrows-turn-to-dots",
  "fa-solid fa-candy-cane",
  "fa-solid fa-stroopwafel",
  "fa-solid fa-cake-candles",
  "fa-solid fa-bowling-ball",
  "fa-solid fa-bath",
  "fa-solid fa-bomb",
  "fa-solid fa-business-time",
  "fa-solid fa-dragon",
  "fa-solid fa-arrow-up-right-dots",
  "fa-solid fa-fire",
  "fa-solid fa-arrows-to-circle",
  "fa-solid fa-cloud-meatball",
  "fa-solid fa-arrows-down-to-people",
  "fa-solid fa-person-walking-arrow-loop-left",
  "fa-solid fa-person-walking-dashed-line-arrow-right",
]);
const randomIcon = computed(() => icons.value[randomIconIndex.value]);

filters.$subscribe((mutation, state) => {
  let newIndex = Math.floor(Math.random() * icons.value.length);
  randomIconIndex.value =
    newIndex === randomIconIndex.value
      ? (newIndex + 1) % icons.value.length
      : newIndex;
});

function toggle(value) {
  filters.alignment.bits =
    (filters.alignment.bits & value) > 0
      ? (filters.alignment.bits | value) ^ value
      : filters.alignment.bits | value;
}

function classes(value) {
  return {
    "bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white":
      filters.alignment.bits & value,
    "bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border text-gray-700 dark:text-white":
      !(filters.alignment.bits & value),
    "cursor-pointer grid place-items-center text-center select-none text-white": true,
  };
}
function reset() {
  filters.alignment.bits = 1023;
}
</script>

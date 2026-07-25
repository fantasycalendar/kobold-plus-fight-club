<script setup>
import { ref, watch } from "vue";
import Slider from "@vueform/slider";
import { useFilters } from "../stores/filters.js";

const filters = useFilters();
const minCr = ref(filters.crValues[Math.round(filters.cr.min)].label);
const maxCr = ref(filters.crValues[Math.round(filters.cr.max)].label);

const defaultValue = ref([0, 33]);
const sliderValue = ref([
    filters.cr.min,
    filters.cr.max
]);
const shadowSliderValue = ref([
    filters.cr.min,
    filters.cr.max
]);

// This formatter function is given to NoUISlider's options, to do one thing:
// Transform numeric indexes into visual label numbers. A simple example:
// If in NoUISlider we select index 2, that becomes CR 1/2, visually.
const resolveOptionLabel = ref((selected) => {
  return filters.crValues[Math.round(selected)].label;
});

// These three watch functions basically just map between indexes and labels.
// The primary reason for that is that noUISlider basically expects to be
// handling numerical values; Thus, we must translate them for display.
watch(minCr, (updatedIndex) => {
  sliderValue.value = [
    filters.crValues.findIndex((entry) => entry.value === updatedIndex),
    sliderValue.value[1],
  ];
});

watch(maxCr, (updatedIndex) => {
  sliderValue.value = [
    sliderValue.value[0],
    filters.crValues.findIndex((entry) => entry.value === updatedIndex),
  ];
});

watch(sliderValue, (value) => {
  minCr.value = filters.crValues[Math.round(value[0])].value;
  maxCr.value = filters.crValues[Math.round(value[1])].value;
});

function updateFilters() {
  shadowSliderValue.value = [...sliderValue.value];
  filters.cr.min = sliderValue.value[0];
  filters.cr.max = sliderValue.value[1];
}

// Called from the min/max <select> boxes. We derive the slider indices
// directly from the current select labels rather than reading sliderValue,
// because the watchers that sync sliderValue from minCr/maxCr flush after
// this handler runs — reading sliderValue here would use a stale value and
// lag the slider/table by one update.
function updateFromSelect() {
  const min = filters.crValues.findIndex((entry) => entry.value === minCr.value);
  const max = filters.crValues.findIndex((entry) => entry.value === maxCr.value);
  sliderValue.value = [min, max];
  shadowSliderValue.value = [min, max];
  filters.cr.min = min;
  filters.cr.max = max;
}

// Now that all the mapping is done, we also want to subscribe to any external
// changes that occur on the store, updating our local data in the process.
// For example, this would allow multiple instances of this component.
filters.$subscribe((mutation, state) => {
  if (
    state.cr.min !== sliderValue.value[0] ||
    state.cr.max !== sliderValue.value[1]
  ) {
    sliderValue.value = [state.cr.min, state.cr.max];
    // shadowSliderValue is what the <Slider> actually renders, so keep it in
    // sync too — otherwise external changes (e.g. Reset Filters) update the
    // selects but leave the slider handles where they were.
    shadowSliderValue.value = [state.cr.min, state.cr.max];
  }
});
</script>

<template>
  <div>
    <div
      class="flex justify-between font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      Challenge Rating

      <span
        @click="sliderValue = defaultValue"
        class="text-center text-white transition-all ease-in-out duration-200"
        :class="{
          'opacity-50':
            sliderValue[0] === defaultValue[0] &&
            sliderValue[1] === defaultValue[1],
          'cursor-pointer':
            sliderValue[0] !== defaultValue[0] ||
            sliderValue[1] !== defaultValue[1],
        }"
      >
        <i
          class="fa fa-undo text-sm h-6 w-6 text-gray-800 dark:text-gray-300"
        ></i>
      </span>
    </div>

    <div
      class="relative px-6 pt-1 pb-3 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-md"
    >
      <div class="mb-4 mt-3 mx-2">
        <Slider
          :min="0"
          :max="33"
          :format="resolveOptionLabel"
          :options="{ tooltips: [false, false], animate: true }"
          v-model="shadowSliderValue"
          @slide="(event) => { sliderValue = [...event]; }"
          @end="updateFilters"
        ></Slider>
      </div>

      <div class="flex justify-between items-center">
        <div class="grow">
          <select
            class="w-full border-gray-300 shadow-xs focus:ring-emerald-500 focus:border-emerald-500 block w-full py-1.5 pl-2.5 pr-0 sm:text-sm disabled:text-gray-600 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"
            name="min_cr"
            id="min_cr_select"
            v-model="minCr"
            @change="updateFromSelect"
          >
            <option
              v-for="option in filters.crValues"
              :key="option.value"
              :value="option.value"
              v-text="option.label"
              :disabled="parseInt(option.value) > parseInt(maxCr)"
            ></option>
          </select>
        </div>
        <div
          class="grow text-center text-gray-500 dark:text-gray-400 user-select-none"
        >
          &le; CR &le;
        </div>
        <div class="grow">
          <select
            class="w-full border-gray-300 shadow-xs focus:ring-emerald-500 focus:border-emerald-500 block w-full py-1.5 pl-2.5 pr-0 sm:text-sm disabled:text-gray-600 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"
            name="max_cr"
            id="max_cr_select"
            v-model="maxCr"
            @change="updateFromSelect"
          >
            <option
              v-for="option in filters.crValues"
              :key="option.value"
              :value="option.value"
              v-text="option.label"
              :disabled="parseInt(option.value) < parseInt(minCr)"
            ></option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="@vueform/slider/themes/default.css"></style>

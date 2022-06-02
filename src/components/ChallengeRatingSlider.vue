<script setup>
import { ref, watch } from "vue";
import Slider from "@vueform/slider";
import { useFilters } from "../stores/filters.js";

const filters = useFilters();
const minCr = ref(0);
const maxCr = ref(0);

const value = ref([0, 33]);

const resolveOptionLabel = ref((selected) => {
  return filters.crValues[Math.round(selected)].label;
});

watch(minCr, (updatedIndex) => {
  value.value = [filters.crValues.findIndex((entry) => entry.value === updatedIndex), value.value[1]];
});

watch(maxCr, (updatedIndex) => {
  value.value = [value.value[0], filters.crValues.findIndex((entry) => entry.value === updatedIndex)];
});

watch(value, (value) => {
  console.log(value);

  filters.cr.min = value[0];
  minCr.value = filters.crValues[Math.round(value[0])].value;
  filters.cr.max = value[1];
  maxCr.value = filters.crValues[Math.round(value[1])].value;
});
</script>

<template>
  <div>
    <div class="block font-medium text-gray-700 dark:text-gray-300 mb-1">
      Challenge Rating
    </div>

    <div
      class="relative px-6 pt-1 pb-4 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-md"
    >
      <div class="my-6 mx-2">
        <Slider :min="0" :max="33" :format="resolveOptionLabel" :options="{tooltips: [false, false]}" v-model="value"></Slider>
      </div>

      <div class="flex justify-between items-center">
        <div class="grow">
          <select
            class="w-full border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full py-1.5 pl-2.5 pr-0 sm:text-sm disabled:text-gray-600 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"
            name="min_cr"
            id="min_cr_select"
            v-model="minCr"
          >
            <option
              v-for="option in filters.crValues"
              :value="option.value"
              v-text="option.label"
              :disabled="parseInt(option.value) < parseInt(minCr)"
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
            class="w-full border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full py-1.5 pl-2.5 pr-0 sm:text-sm disabled:text-gray-600 disabled:bg-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 text-gray-600 rounded-md"
            name="max_cr"
            id="max_cr_select"
            v-model="maxCr"
          >
            <option
                v-for="option in filters.crValues"
              :value="option.value"
              v-text="option.label"
              :disabled="parseInt(option.value) > parseInt(maxCr)"
            ></option>
          </select>
        </div>
      </div>

      <span
        @click="value = [0, 33]"
        v-show="value !== [0, 33]"
        class="absolute top-1 right-1 text-center cursor-pointer"
      >
        <i
          class="fa fa-undo text-sm h-6 w-6 text-gray-800 dark:text-gray-300"
        ></i>
      </span>
    </div>
  </div>
</template>

<style src="@vueform/slider/themes/default.css"></style>

<template>
  <div class="mt-1 relative" v-click-away="closeDropdown">
    <button
      @click="openDropdown"
      type="button"
      class="bg-white dark:bg-gray-700 relative w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-labelledby="listbox-label"
    >
      <span
        class="block truncate"
        v-text="label ?? modelValue"
      ></span>
      <span
        class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
      >
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    <transition
      enter-active-class=""
      enter-from-class=""
      enter-to-class=""
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-show="open"
        class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
      >
        <li
          v-for="option of options"
          :key="option.key"
          @click="setValue(option)"
          :class="{
            'text-white bg-emerald-600': modelValue === option.key,
            'text-gray-900 dark:text-gray-300': modelValue !== option.key,
          }"
          class="group hover:text-white hover:bg-emerald-600 cursor-default select-none relative py-2 pl-3 pr-9"
          role="option"
        >
          <span
            class="group-hover:text-white font-normal block truncate"
            v-html="option.label"
          >
          </span>
          <span
            :class="{
              'text-gray-200': modelValue === option.key,
              'text-gray-600 dark:text-gray-400': modelValue !== option.key,
            }"
            class="text-xs group-hover:text-gray-200"
            v-if="hasOptionSubtext"
            v-text="optionSubtext(option)"
          ></span>

          <span
            v-show="modelValue === option.key"
            :class="{
              'text-white': modelValue === option.key,
              'text-emerald-600': modelValue !== option.key,
            }"
            class="absolute inset-y-0 right-0 flex items-center pr-4"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
import * as helpers from "../js/helpers.js";
export default {
  name: "SelectInput",
  props: {
    modelValue: {
      type: String,
    },
    options: {
      type: Array,
      default: [],
    },
    optionSubtext: {
      type: Function,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      open: false,
    };
  },
  methods: {
    setValue(value) {
      this.$emit("update:modelValue", value.key);
      this.open = false;
    },
    openDropdown() {
      this.open = true;
    },
    closeDropdown() {
      this.open = false;
    },
  },
  computed: {
    hasOptionSubtext() {
      return !!this.optionSubtext;
    },
  },
};
</script>

<style scoped></style>

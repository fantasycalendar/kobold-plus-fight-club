<script setup>
import { ref } from "vue";
const props = defineProps(["modelValue", "darker", "end"]);
const emit = defineEmits(["update:modelValue"]);

const input = ref(null);
const end = ref(props.end);

function toggleValue() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <div
    :class="{
      'order-1 flex justify-center': true,
      'md:justify-start': !end,
      'md:justify-end': end,
    }"
  >
    <button
      @click="toggleValue"
      type="button"
      :class="{
        'bg-gray-200 dark:bg-gray-700': !modelValue && !darker,
        'bg-gray-400 dark:bg-gray-800': !modelValue && darker,
        'bg-emerald-600': modelValue,
      }"
      class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      role="switch"
      aria-checked="false"
      aria-labelledby="availability-label"
      aria-describedby="availability-description"
    >
      <span
        aria-hidden="true"
        :class="{
          'translate-x-0': !modelValue,
          'translate-x-5': modelValue,
        }"
        class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
      ></span>
    </button>
  </div>
</template>

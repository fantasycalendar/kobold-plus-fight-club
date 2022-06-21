<template>
  <button
    type="button"
    class="relative block w-full border-2 border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 border-dashed rounded-lg p-6 md:p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
  >
    <i
      class="text-2xl h-12 w-12 mx-auto text-gray-400 dark:text-gray-300"
      :class="icon"
    ></i>
    <span
      class="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-200"
    >
      <slot></slot>
    </span>
  </button>
</template>

<script>
export default {
  name: "EmptyState",
  props: {
    icon: String,
  },
};
</script>
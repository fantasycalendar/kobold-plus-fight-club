<script setup>

const props = defineProps({
  color: {
    type: String,
    default: "emerald"
  },
})

</script>

<template>
  <!-- Colors: emerald, gray, red, green, yellow, blue, indigo, purple, pink -->
  <span
    :class="{
      'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset': true,
      'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-gray-400 dark:ring-gray-400/20': color === 'emerald',
      'bg-gray-50 text-gray-700 ring-gray-600/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20': color === 'gray',
      'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-gray-400 dark:ring-gray-400/20': color === 'red',
      'bg-green-50 text-green-700 ring-green-600/10 dark:bg-green-500/10 dark:text-gray-400 dark:ring-gray-500/20': color === 'green',
      'bg-yellow-50 text-yellow-800 ring-yellow-600/10 dark:bg-yellow-400/10 dark:text-gray-500 dark:ring-gray-400/20': color === 'yellow',
      'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-400/10 dark:text-gray-400 dark:ring-gray-400/20': color === 'blue',
      'bg-indigo-50 text-indigo-700 ring-indigo-600/10 dark:bg-indigo-400/10 dark:text-gray-400 dark:ring-gray-400/20': color === 'indigo',
      'bg-purple-50 text-purple-700 ring-purple-600/10 dark:bg-purple-400/10 dark:text-gray-400 dark:ring-gray-400/20': color === 'purple',
      'bg-pink-50 text-pink-700 ring-pink-600/10 dark:bg-pink-400/10 dark:text-gray-400 dark:ring-gray-400/20': color === 'pink',
    }"
  >
    <slot></slot>
  </span>
</template>

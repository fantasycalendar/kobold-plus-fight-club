<template>
  <th
    scope="col"
    class="px-3 py-3.5 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-300 select-none cursor-pointer group whitespace-nowrap"
    @click="$emit('sort', sortsColumn)"
  >
    {{ label }}
    <span
      v-if="sortsColumn"
      class="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible px-1 hover:bg-gray-100 hover:dark:bg-gray-600"
      :class="{
        invisible: sortBy !== sortsColumn,
        'bg-gray-100 dark:bg-gray-600': sortBy === sortsColumn,
      }"
    >
      <i
        class="fa-solid"
        :class="{
          'fa-chevron-down': sortByDesc || sortBy !== sortsColumn,
          'fa-chevron-up': !sortByDesc && sortBy === sortsColumn,
        }"
      ></i>
    </span>
  </th>
</template>

<script>
export default {
  name: "MonsterTableHeading",
  props: {
    label: String,
    sortsColumn: String,
    sortBy: String,
    sortByDesc: Boolean,
  },
};
</script>

<style scoped></style>

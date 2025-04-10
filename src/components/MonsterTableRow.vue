<script setup>
import {useEncounter} from "../stores/encounter";
import Monster from "../js/monster";
import Badge from "./Badge.vue";

const props = defineProps({
  monster: {
    type: Monster,
  },
});

const encounter = useEncounter();
</script>

<template>
  <tr
    class="odd:bg-gray-50 even:bg-gray-100 dark:odd:bg-gray-700 dark:even:bg-gray-800"
  >
    <td
      class="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-300 text-center w-8 max-w-8"
    >
      <span
        class="primary-link cursor-pointer select-none"
        @click="encounter.addMonster(monster)"
        :title="encounter.getDifficultyFromCr(monster.cr)"
        >Add</span
      >
    </td>
    <td
      class="w-full max-w-0 py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 w-64 max-w-64 truncate"
    >
      <span class="truncate" v-text="monster.name"></span>
      <span v-show="monster.tags.length" class="inline-flex space-x-1 ml-2">
        <Badge v-for="tag in monster.tags">
          {{ tag.toLowerCase() }}
        </Badge>
      </span>
      <dt class="sr-only sm:hidden">Type</dt>
      <dd
        class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden"
        v-text="monster.type"
      ></dd>
      <dl class="font-normal">
        <dt class="sr-only">Sources</dt>
        <dd class="mt-1 truncate text-gray-500 dark:text-gray-400">
          <span
            :title="source.fullText"
            v-for="(source, index) of monster.sources"
            :key="source.name"
            v-html="
              `<span class='underline decoration-dotted cursor-help underline-offset-2 decoration-gray-400 dark:decoration-gray-500'>${source.reference.shortname}</span>` +
              (index < monster.sources.length - 1 ? ', ' : '')
            "
          ></span>
        </dd>
      </dl>
    </td>
    <td
      class="hidden px-3 pl-2 pr-4 text-sm text-gray-500 dark:text-gray-300 xl:table-cell w-32 text-right"
      v-text="monster.alignment.string"
    ></td>
    <td
      class="px-3 py-2 text-sm text-gray-500 dark:text-gray-300 table-cell w-32 max-w-32 truncate"
    >
      <span class="truncate" v-text="monster.size"></span>
      <dl class="font-normal">
        <dt class="sr-only sm:hidden">CR</dt>
        <dd class="mt-1 truncate text-gray-500 dark:text-gray-400 sm:hidden">
          CR
          <span
            v-text="monster.cr.string"
            class="pl-1"
            :class="encounter.getDifficultyClassColorFromCr(monster.cr)"
          ></span>
        </dd>
        <dt class="sr-only sm:hidden">Alignment</dt>
        <dd
          class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden"
          v-text="monster.alignment.string"
        ></dd>
      </dl>
    </td>
    <td
      class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32"
      v-text="monster.type"
    ></td>
    <td
      class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 sm:table-cell w-32"
    >
      <span :class="encounter.getDifficultyClassColorFromCr(monster.cr)">
        <span v-text="monster.cr.string"></span>
        <span
          v-text="
            ' (' + encounter.getDifficultyFromCr(monster.cr) + ')'
          "
          class="text-xs hidden sm:inline opacity-90"
        ></span>
      </span>
    </td>
  </tr>
</template>

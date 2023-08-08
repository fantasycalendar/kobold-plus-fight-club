<script setup>
import {useEncounter} from "../stores/encounter";
import Monster from "../js/monster";

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
        :title="encounter.getDifficultyFromExperience(monster.cr.exp)"
        >Add</span
      >
    </td>
    <td
      class="w-full max-w-0 py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 w-64 max-w-64 truncate"
    >
      <span class="truncate" v-text="monster.name"></span>
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
          <span v-text="monster.tags?.length ? ' - ' + monster.tags.join(', ') : ''"></span>
        </dd>
        <dt class="sr-only sm:hidden">Type</dt>
        <dd
          class="mt-1 truncate text-gray-500 dark:text-gray-400 lg:hidden"
          v-text="monster.type"
        ></dd>
      </dl>
    </td>
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
            :class="{
              'text-indigo-300 dark:text-indigo-600':
                encounter.getDifficultyFromExperience(monster.cr.exp) ===
                'Trivial',
              'text-green-300 dark:text-green-600':
                encounter.getDifficultyFromExperience(monster.cr.exp) ===
                'Easy',
              'text-yellow-300 dark:text-yellow-600':
                encounter.getDifficultyFromExperience(monster.cr.exp) ===
                'Medium',
              'text-amber-300 dark:text-orange-600':
                encounter.getDifficultyFromExperience(monster.cr.exp) ===
                'Hard',
              'text-rose-300 dark:text-rose-600':
                encounter.getDifficultyFromExperience(monster.cr.exp) ===
                'Deadly',
            }"
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
      class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 sm:table-cell w-32"
    >
      <span
        :class="{
          'text-cyan-600 dark:text-cyan-400':
            encounter.getDifficultyFromExperience(monster.cr.exp) === 'Trivial',
          'text-green-600 dark:text-green-400':
            encounter.getDifficultyFromExperience(monster.cr.exp) === 'Easy',
          'text-yellow-600 dark:text-yellow-400':
            encounter.getDifficultyFromExperience(monster.cr.exp) === 'Medium',
          'text-amber-600 dark:text-orange-400':
            encounter.getDifficultyFromExperience(monster.cr.exp) === 'Hard',
          'text-rose-600 dark:text-rose-500':
            encounter.getDifficultyFromExperience(monster.cr.exp) === 'Deadly',
        }"
      >
        <span v-text="monster.cr.string"></span>
        <span
          v-text="
            ' (' + encounter.getDifficultyFromExperience(monster.cr.exp) + ')'
          "
          class="text-xs"
        ></span>
      </span>
    </td>
    <td
      class="hidden px-3 py-2 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32"
      v-text="monster.type"
    ></td>
    <td
      class="hidden px-3 pl-2 pr-4 text-sm text-gray-500 dark:text-gray-300 lg:table-cell w-32 text-right"
      v-text="monster.alignment.string"
    ></td>
  </tr>
</template>

<template>
  <div class="grid w-full py-2 grid-cols-[1fr_130px] relative">
    <div class="flex flex-row justify-between col-span-2">
      <div class="flex items-center">
        <span
          :title="group.monster.name"
          data-tippy-placement="top-start"
          data-tippy-delay="1000"
          class="pr-1 font-semibold max-w-full overflow-ellipsis truncate"
          v-text="group.monster.name"
        ></span>
        <button
          class="button-primary-sm text-sm ml-0.5"
          @click="showSources = !showSources"
        >
          <i class="fa fa-book-bookmark"></i>
        </button>
      </div>

      <div
        title="Shuffle monster"
        @click="$emit('shuffle')"
        class="grid place-items-center text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 cursor-pointer"
      >
        <i class="fas fa-random"></i>
      </div>
    </div>

    <div>
      <div>
        <span
          class="text-sm"
          v-text="'CR: ' + group.monster.cr.string"
        ></span>
        <span class="text-sm px-1">&bull;</span>
        <span
          v-text="'XP: ' + formatNumber(group.monster.experience)"
          class="text-sm"
        ></span>
      </div>
      <div>
        <Badge
          class="mr-1"
          v-for="tag in [group.monster.type, ...group.monster.tags]"
        >
          {{ tag.toLowerCase() }}
        </Badge>
      </div>
    </div>

    <div class="flex shrink-0 justify-self-end items-start">
      <div class="flex rounded-md shadow-sm pt-3">
        <button
          @click="$emit('add')"
          class="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 sm:text-sm"
        >
          <i class="fa fa-plus w-5"></i>
        </button>

        <label for="monster-number"></label>

        <input
          id="monster-number"
          type="number"
          min="1"
          class="flex-1 min-w-0 block w-12 px-1 py-1.5 rounded-none dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300"
          :value="group.count"
          @input="$emit('count', Math.max(0, $event.target.value))"
        />

        <button
          @click="$emit('subtract')"
          :class="{
            'border-gray-300 dark:border-gray-600 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500':
            group.count > 1,
            'border-red-200 dark:border-red-700 dark:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-800 dark:hover:bg-red-700 text-red-500':
            group.count === 1,
          }"
          class="inline-flex items-center px-2 rounded-r-md border border-l-0 sm:text-sm"
        >
          <i
            :class="{
              'fa-minus': group.count > 1,
              'fa-times': group.count === 1,
            }"
            class="fa w-5"
          ></i>
        </button>
      </div>
    </div>

    <div
      class="bg-gray-700 rounded shadow px-2 py-1 z-10 col-span-2 my-2 relative"
      v-if="showSources"
    >
      <div class="overflow-hidden whitespace-nowrap overflow-ellipsis">
        <div
          class="absolute top-1 right-2"
          @click="showSources = false"
          title="Dismiss"
        >
          <i class="fa fa-times text-gray-500 cursor-pointer text-xl"></i>
        </div>

        <strong class="text-sm">Sources:</strong>

        <ul class="list-disc list-inside max-w-full ml-2">
          <li
            v-for="source in group.monster.sources"
            class="max-w-full truncate"
            :title="source.fullText"
            data-tippy-delay="1000"
            v-html="
            source.reference.link
              ? `<a class='primary-link text-sm leading-6' href='${source.reference.link}' target='_blank'>${source.fullText}</a>`
              : source.fullText
            "
          ></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import * as helpers from "../js/helpers";
import Badge from "./Badge.vue";

export default {
  name: "EncounterMonster",
  components: {
    Badge,
  },
  data() {
    return {
      showSources: false,
    };
  },
  props: {
    group: Object,
  },
  methods: {
    formatNumber(number) {
      return helpers.formatNumber(number);
    },
  },
};
</script>

<style scoped></style>

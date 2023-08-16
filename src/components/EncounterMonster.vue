<template>
  <div>
    <div class="flex flex-row w-full mb-4 relative">
      <div class="grow pb-2 min-w-0">
        <div class="grid grid-cols-[1fr_20px]">
          <span
            :title="group.monster.name"
            data-tippy-placement="top-start"
            data-tippy-delay="1000"
            class="text-lg pr-3 font-semibold max-w-full overflow-ellipsis truncate"
            v-text="group.monster.name"
          ></span>
          <div
            title="Shuffle monster"
            @click="$emit('shuffle')"
            class="grid place-items-center text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 cursor-pointer"
          >
            <i class="fas fa-random"></i>
          </div>
        </div>

        <div class="mb-2">
          <Badge v-for="tag in group.monster.tags">
            {{ tag.toLowerCase() }}
          </Badge>
        </div>

        <div>
          <span
            class="text-base"
            v-text="'CR: ' + group.monster.cr.string"
          ></span>
          <span
            class="text-base ml-4"
            v-text="'XP: ' + formatNumber(group.monster.experience)"
          ></span>
          <div
            class="overflow-hidden whitespace-nowrap overflow-ellipsis pr-40"
          >
            <ul class="list-none text-s italic max-w-full">
              <li
                v-for="source in group.monster.sources"
                class="max-w-full truncate"
                :title="source.fullText"
                data-tippy-delay="1000"
                v-html="
                  source.reference.link
                    ? `<a class='primary-link' href='${source.reference.link}' target='_blank'>${source.fullText}</a>`
                    : source.fullText
                "
              ></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="absolute bottom-3 right-0 flex shrink-0 items-center">
        <div class="flex rounded-md shadow-sm">
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
            class="flex-1 min-w-0 block w-16 px-3 py-2 rounded-none dark:bg-gray-700 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm border-gray-300"
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
    </div>
  </div>
</template>

<script>
import * as helpers from "../js/helpers";
import Badge from "./Badge.vue";

export default {
  name: "EncounterMonster",
  components: { Badge },
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

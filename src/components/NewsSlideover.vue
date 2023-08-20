<script setup>
import Multiselect from "@vueform/multiselect";
import { useModals } from "../stores/modals";
import { useNews } from "../stores/news";
import { ref } from "vue";

const modals = useModals();
const news = useNews();

</script>

<style src="@vueform/multiselect/themes/default.css"></style>

<template>
  <div
    class="fixed inset-0 z-30 overflow-hidden"
    aria-labelledby="slide-over-title"
    role="dialog"
    aria-modal="true"
    v-show="news.open"
    v-cloak
  >
    <div class="absolute inset-0 overflow-hidden">
      <!-- Background overlay, show/hide based on slide-over state. -->
      <transition
        enter-active-class="ease-in-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in-out duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          @click="news.hide"
          class="absolute inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          v-show="news.open"
        ></div>
      </transition>

      <div
        class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
      >
        <transition
          enter-active-class="transform transition ease-in-out duration-200"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transform transition ease-in-out duration-200"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            class="pointer-events-auto w-screen max-w-md sm:duration-700"
            v-show="news.open"
          >
            <div
              class="relative flex max-h-screen h-full flex-col overflow-y-hidden bg-white dark:bg-gray-800 shadow-xl"
            >
              <div
                class="px-4 sm:px-6 border-b dark:border-gray-700 py-6"
              >
                <div class="flex items-start justify-between">
                  <h2
                    class="text-lg font-medium text-gray-900 dark:text-gray-200"
                    id="slide-over-title"
                  >
                    Kobold+ News
                  </h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button
                      @click="news.hide"
                      type="button"
                      class="rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <span class="sr-only">Close panel</span>
                      <!-- Heroicon name: outline/x -->
                      <svg
                        class="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div
                class="flex h-full flex-col relative flex-1 px-4 py-6 sm:px-6 space-y-4 overflow-y-auto scrollbar"
              >
                <ul role="list" class="divide-y divide-gray-100 dark:divide-gray-700">
                  <li
                    v-for="item in news.articles"
                    class="py-4"
                  >
                    <div class="flex items-center gap-x-3">
                      <i class="fa fa-newspaper text-center"></i>
                      <h3 class="flex-auto truncate text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300">{{ item.title }}</h3>
                      <time :datetime="item.date" class="flex-none text-xs text-gray-500">{{ item.date }}</time>
                    </div>
                    <div class="prose dark:prose-invert prose-a:text-emerald-700 dark:prose-a:text-emerald-500 hover:prose-a:text-emerald-600 dark:hover:prose-a:text-emerald-600">
                      <p class="mt-3 text-sm text-gray-600 dark:text-gray-400" v-html="item.text"></p>
                    </div>

                    <div v-if="item.action_type === 'source'" class="mt-2">
                    <button
                      @click="() => { news.source(item.source); }"
                      type="button"
                      class="button-primary-sm !p-2 !px-4 w-full justify-center"
                    >
                      {{ item.action }}
                    </button>
                  </div>

                    <div v-if="item.action_type === 'modal'" class="mt-2">
                      <button
                        @click="() => { modals.show(item.modal); news.hide(); }"
                        type="button"
                        class="button-primary-sm !p-2 !px-4 w-full justify-center"
                      >
                        {{ item.action }}
                      </button>
                    </div>

                    <div v-if="item.action_type === 'link'" class="mt-2">
                      <a :href="item.action_url" target="_blank" class="primary-link text-sm">{{ item.action }}</a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

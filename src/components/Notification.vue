<template>
    <div class="p-4" :class="{ 'mb-2': !notification.sticky }">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i
              class="fa"
              :class="{
            'fa-check-circle': !notification.icon,
            'text-emerald-400': !notification.icon_color,
            [notification.icon]: notification.icon,
            [notification.icon_color]: notification.icon_color,
          }"
          ></i>
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p
              class="text-sm font-medium text-gray-900 dark:text-gray-300"
              v-text="notification.title"
          ></p>
          <p
              class="mt-1 text-sm text-gray-500 dark:text-gray-400"
              v-show="notification.body"
              v-html="notification.body"
          ></p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
              class="bg-white dark:bg-gray-500 dark:text-gray-800 rounded-md inline-flex text-gray-400 dark:text-gray-800 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              @click="$emit('dismiss', notification.id)"
          >
            <span class="sr-only">Close</span>
            <!-- Heroicon name: solid/x -->
            <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
            >
              <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div
        class="absolute inset-x-0 bottom-0 bg-gray-50 dark:bg-gray-700 h-2"
        v-show="!notification.sticky"
    >
      <transition
          v-show="notification.timer"
          leave-active-class="transition-all ease-linear duration-[2900ms]"
          leave-from-class="w-full"
          leave-to-class="w-0"
      >
        <div :class="{
              'bg-emerald-500': !notification.icon_color,
              [notification.icon_color]: notification.icon_color,
            }"
            class="absolute inset-x-0 left-0 h-full"></div>
      </transition>
    </div>
</template>

<script setup>
  import { defineEmits } from "vue";

  const props = defineProps({
    notification: {
      type: Object
    }
  });

  const emit = defineEmits(['dismiss']);

  if(!props.notification.show) {
    setTimeout(() => props.notification.show = true, 100);
  }

  if(!props.notification.sticky) {
    props.notification.timer = true;
    setTimeout(() => props.notification.timer = false, 100);
  }
</script>

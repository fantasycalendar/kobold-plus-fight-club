<template xmlns:x-transition="http://www.w3.org/1999/xhtml">
  <transition
      enter="transform ease-out duration-300 transition"
      enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leave-from="opacity-100"
      leave-to="opacity-0"
      v-show="notification.show"
  >
    <div
        class="max-w-sm w-full relative bg-white dark:bg-gray-700 dark:shadow-xl shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
    >
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
                @click="$emit('dismiss')"
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
            v-show="!notification.show"
            leave="transition-all ease-linear duration-[2900ms]"
            leave-from="w-full"
            leave-to="w-0"
        >
          <div
              class="absolute inset-x-0 left-0 h-full"
              :class="{
                'bg-emerald-500': !notification.icon_color,
                [notification.icon_color?.replace('text-', 'bg-')]: notification.icon_color,
              }"></div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    notification: {
      type: Object,
      default: {
        sticky: false,
        icon: false,
        icon_color: false,
        title: "A notification",
        body: "Another notification",
      }
    }
  },
  mounted() {
    setTimeout(() => (this.notification.show = true), 100);

    if (!this.notification.sticky) {
      setTimeout(() => {
        this.notification.show = false;
        this.$emit('dismiss');
        console.log('dismissing');
      }, 3000);
    }
  },
};
</script>

<style scoped></style>

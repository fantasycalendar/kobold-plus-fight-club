<script setup>
import { ref } from "vue";
import {useNotifications} from "../stores/notifications.js";

const notifications = useNotifications();

const props = defineProps({
  theme: {
    type: String,
    default: 'dark',
  }
});

const menu = ref(false);
</script>

<template>
  <nav
    class="bg-emerald-700 border-b border-gray-200 dark:border-gray-900 shrink-0"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-6">
      <div class="flex justify-between h-16 w-full">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <a href="" class="flex items-center">
              <img
                class="h-8 w-auto"
                src="/src/assets/images/header_logo.png"
                alt="Kobold Plus Fight Club"
              />
              <span class="hidden md:inline pl-2 text-lg font-bold text-white"
                >Kobold+ Fight Club</span
              >
            </a>
          </div>
        </div>
        <div
          class="hidden lg:flex text-white lg:-my-px lg:ml-6 lg:space-x-8 items-center"
        >
          <a
              @click="notifications.notify({
                title:'A test notification',
                body: 'With a body'
              })"
              href="javascript:"
              class="inline-flex items-center px-1 text-sm font-medium text-emerald-300 hover:text-white hover:border-gray-300"
          >
            Test Notification
          </a>
          <a
            @click="$emit('modal', { name: 'Keyboard' })"
            href="javascript:"
            class="inline-flex items-center px-1 text-sm font-medium text-emerald-300 hover:text-white hover:border-gray-300"
            >Keyboard Shortcuts
            <span
              class="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-emerald-800 text-emerald-100 ml-1"
              >Ctrl+/</span
            ></a
          >
          <a
            @click="$emit('modal', { name: 'Importer' })"
            href="javascript:"
            class="inline-flex items-center px-1 text-sm font-medium text-emerald-300 hover:text-white hover:border-gray-300"
            >Import Custom Monsters</a
          >
          <a
            target="_blank"
            href="https://ko-fi.com/fantasycomputerworks"
            class="inline-flex items-center px-1 text-sm font-medium text-emerald-300 hover:text-white hover:border-gray-300"
            >Donate</a
          >
          <a
            target="_blank"
            href="https://fantasycomputer.works/"
            class="inline-flex items-center px-1 text-sm font-medium text-emerald-300 hover:text-white hover:border-gray-300"
            >About</a
          >
          <a
            title="Toggle light mode (ctrl+shift+\)"
            @click="$emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
            href="javascript:"
            class="inline-flex items-center px-1 text-sm font-medium text-emerald-300 hover:text-white hover:border-gray-300 h-full"
          >
            <i
              :class="{
                'fa-moon': theme === 'light',
                'fa-sun': theme === 'dark',
              }"
              class="fa"
            ></i>
          </a>
        </div>
        <div class="-mr-2 flex items-center lg:hidden">
          <button
            class="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            @click="menu = !menu"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="block h-6 w-6"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              class="hidden h-6 w-6"
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
      class="transition-all duration-400 ease-in-out overflow-hidden"
      v-show="menu"
    >
      <div class="pt-2 pb-3 space-y-1">
        <a
          href="https://fantasy-calendar.com/"
          class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-emerald-300 hover:text-white hover:border-gray-300"
          >Fantasy Calendar</a
        >
        <a
            @click="$emit('modal', { name: 'Importer' })"
            href="javascript:"
            class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-emerald-300 hover:text-white hover:border-gray-300"
        >Import Custom Monsters</a>
        <a
          href="javascript:"
          class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-emerald-300 hover:text-white hover:border-gray-300"
          >
          About
        </a>
        <a
          title="Toggle light mode (ctrl+shift+\)"
          @click="$emit('update:theme', theme === 'dark' ? 'light' : 'dark')"
          href="javascript:"
          class="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-emerald-300 hover:text-white hover:border-gray-300"
        >
          <i :class="theme === 'light' ? 'fa-moon' : 'fa-sun'" class="fa"></i>
          <span class="ml-1">Toggle theme</span>
        </a>
      </div>
    </div>
  </nav>
</template>
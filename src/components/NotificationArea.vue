<script setup>
import Notification from "./Notification.vue";
import {useNotifications} from "../stores/notifications.js";

const notifications = useNotifications();
</script>

<template>
  <div
    aria-live="assertive"
    class="fixed inset-0 flex items-end z-50 px-4 py-6 pointer-events-none sm:p-6 sm:items-end"
  >
    <TransitionGroup name="notifications" tag="div" class="w-full flex flex-col items-center space-y-4 sm:items-end">
      <div class="max-w-sm w-full relative bg-white dark:bg-gray-700 dark:shadow-xl shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden" v-for="(notification, index) in notifications.entries" :key="index">
        <Notification
            :notification="notification"
            @dismiss="notifications.dismiss(index)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

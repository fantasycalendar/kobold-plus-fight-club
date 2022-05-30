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
    <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
      <Notification
        v-for="(notification, index) in notifications.entries"
        :notification="notification"
        :key="index"
        @dismiss="notifications.dismiss(index)"
      />
    </div>
  </div>
</template>

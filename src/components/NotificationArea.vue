<script setup>
import Notification from "./Notification.vue";
</script>

<template>
  <div
    aria-live="assertive"
    class="fixed inset-0 flex items-end z-50 px-4 py-6 pointer-events-none sm:p-6 sm:items-end"
  >
    <div class="w-full flex flex-col items-center space-y-4 sm:items-end">
      <Notification
        v-for="(notification, index) in notifications"
        :notification="notification"
        :key="index"
        @dismiss="dismiss(index)"
      />
    </div>
  </div>
</template>

<script>
export default {
  components: { Notification },

  name: "NotificationArea",
  data() {
    return {
      notifications: [],
    };
  },

  created: function () {
    window.addEventListener("notification", (event) =>{
      this.notification(event.detail);
    });
  },

  destroyed: function () {
    window.removeEventListener("notification", (event) =>
        this.notification(event.detail)
    );
  },

  methods: {
    notification(notification) {
      notification.show = false;
      this.notifications.push(notification);
    },

    dismiss(index) {
      this.notifications.splice(index, 1);
    }
  },
};
</script>

<style scoped></style>

<template>
  <div aria-live="assertive" class="fixed inset-0 flex items-end z-50 px-4 py-6 pointer-events-none sm:p-6 sm:items-end" @notification.window="notification">
	<div class="w-full flex flex-col items-center space-y-4 sm:items-end">
	  <Notification v-for="(notification, index) in notifications" :notification="notification" :key="index" />
	</div>
  </div>
</template>

<script>
export default {
  name: "NotificationArea",
  data() {
	return {
	  notifications: [],
	}
  },

  methods: {
	notification(notification) {
	  this.notifications.push(notification);
	}
  }
}
</script>

<style scoped>

</style>
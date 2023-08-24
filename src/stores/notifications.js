import { defineStore,acceptHMRUpdate } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";

export const useNotifications = defineStore("notifications", {
  state: () => {
    return {
      entries: [],
      idIncrement: 1,
      timeouts: [],
    };
  },
  actions: {
    getId() {
      return this.idIncrement++;
    },

    dismissAll() {
      this.entries = [];
    },

    dismiss(dismissId) {
      const index = this.entries.findIndex(
        (notification) => notification.id === dismissId
      );

      if (
        "callback" in this.entries[index] &&
        typeof this.entries[index].callback === "function"
      ) {
        this.entries[index].callback();
      }

      if (typeof this.timeouts[dismissId] !== "undefined") {
        clearTimeout(this.timeouts[dismissId]);
      }

      this.entries.splice(index, 1);
    },

    notify(notification, body = null) {
      if (typeof notification === "string") {
        notification = {
          title: notification,
          body: body,
          component: false,
          sticky: false,
          callback: null,
          icon_color: false,
          icon: false,
          show: true,
        };
      }

      notification.id = this.getId();

      this.entries.push(notification);

      if (!notification.sticky) {
        this.timeouts[notification.id] = setTimeout(
          () => this.dismiss(notification.id),
          3000
        );
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotifications, import.meta.hot));
}

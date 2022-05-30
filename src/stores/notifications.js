import { defineStore } from 'pinia';

export const useNotifications = defineStore('notifications', {
    state: () => {
        return {
            entries: [{
                sticky: true,
                icon: false,
                icon_color: false,
                title: "A notification",
                body: "Another notification",
                show: true,
            }]
        }
    },
    actions: {
        dismiss(index) {
            if(typeof this.entries[index].callback === 'function') {
                this.entries[index].callback();
            }

            this.entries.splice(index, 1);
        },
        notify(notification, body = null) {
            if(typeof notification === 'string') {
                notification = {
                    title: notification,
                    body: body,
                    sticky: false,
                    callback: null,
                    icon_color: false,
                    icon: false,
                    show: true,
                }
            }

            const newIndex = this.entries.push(notification) - 1;

            if(!notification.sticky) {
                setTimeout(() => this.dismiss(newIndex), 3000);
            }
        }
    }
})
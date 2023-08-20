import { defineStore, acceptHMRUpdate } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import { useSources } from "./sources";
import { useModals } from "./modals";
import { useNotifications } from "./notifications";
import { useEncounter } from "./encounter";

export const useNews = defineStore("news", {
  state: () => {
    return {
      open: false,
      latest: useLocalStorage("latestNewsSeen", 0),
      articles: [],
    };
  },
  actions: {
    show() {
      this.open = true;
      this.latest = this.articles.length;
    },
    hide() {
      this.open = false;
    },
    async fetch() {
      // Fetch the latest news from /articles.json, and compare the ID to the latest seen
      // If the latest news is newer than the latest seen, return true

      this.articles = await fetch("/articles.json")
        .then((response) => {
          return response.json();
        }).then((json) => {
          return json.articles;
        });
    },
    source(methodShorthand) {
      let methodName = 'enable' + methodShorthand.charAt(0).toUpperCase() + methodShorthand.slice(1);

      this[methodName]();
    },
    enableMcdm() {
      let mcdmSource = useSources().find("Flee Mortals");

      if (!mcdmSource.enabled || useEncounter().strategy !== "mcdm") {
        mcdmSource.enabled = true;

        setTimeout(() => {
          useEncounter().setStrategy("mcdm");

          useNotifications().notify({
            title: "Flee, Mortals! has been enabled.",
            body: "We've added <strong>Flee, Mortals!</strong> from MCDM to your sources.",
            sticky: true,
          });
        }, 700);
      } else {
        useNotifications().notify({
          title: "Flee, Mortals! is already enabled.",
          body: "You've already added <strong>Flee, Mortals!</strong> to your sources.",
          icon: "fa fa-info-circle",
          icon_color: "text-blue-500",
          sticky: true,
        });
      }

      useModals().show("strategy");
      this.hide();
    }
  },
  getters: {
    hasUnread() {
      return (this.articles.length > this.latest);
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNews, import.meta.hot));
}

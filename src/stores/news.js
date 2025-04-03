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
            body: "<p>We've added <strong>Flee, Mortals!</strong> from MCDM to your sources.</p><p class='mt-1'>You can toggle it along with any other sources using the <strong>Manage sources</strong> button in the filter panel.</p>",
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
    },
    enableDnd2024() {

      if (useEncounter().strategy !== "dnd2024") {

        setTimeout(() => {
          useEncounter().setStrategy("dnd2024");

          useNotifications().notify({
            title: "D&D5e 2024 encounter rules has been enabled.",
            body: "<p>We've enabled the <strong>D&D5e 2024</strong> encounter rules.</p>",
            sticky: true,
          });
        }, 700);
      } else {
        useNotifications().notify({
          title: "D&D5e 2024 encounter rules are already enabled.",
          body: "You've already enabled the <strong>D&D5e 2024</strong> encounter rules.",
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

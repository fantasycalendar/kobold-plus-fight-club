import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import { versionCompare } from "../js/helpers";

export const useSources = defineStore("sources", {
  state: () => {
    return {
      version: "",
      storedVersion: "",

      loaded: [],
      all: useLocalStorage("sources", []),
    };
  },

  hydrate(storeState, initialState) {
    storeState.all = useLocalStorage("sources", []);
  },

  actions: {
    find(name) {
      return this.all.filter((source) => source.name === name)[0] ?? null;
    },

    async fetch() {
      // if (
      //   this.loaded.length &&
      //   versionCompare(this.version, this.storedVersion) === 0
      // ) {
      //   return this.loaded;
      // }

      let fetched = [];

      await fetch("/src/assets/json/se_sources.json")
        .then((res) => res.json())
        .then((data) => {
          fetched = fetched.concat(data);
        });

      await fetch("/src/assets/json/se_third_party_sources.json")
        .then((res) => res.json())
        .then((data) => {
          fetched = fetched.concat(data);
        });

      await fetch("/src/assets/json/se_community_sources.json")
        .then((res) => res.json())
        .then((data) => {
          fetched = fetched.concat(data);
        });

      this.loaded = this.loaded.length
        ? fetched.map((newSource) => {
            const foundOldSource = this.loadedSources.find((oldSource) => {
              return newSource["name"] === oldSource["name"];
            });

            newSource.enabled = foundOldSource
              ? foundOldSource.enabled
              : !!newSource.default;

            return newSource;
          })
        : fetched.map((source) => {
            source.enabled = !!source.default;
            return source;
          });

      console.log(this.loaded);

      this.all = this.loaded;

      return this.all;
    },
  },

  getters: {
    formatted() {
      return this.all.reduce((acc, source) => {
        acc[source.name] = source;
        return acc;
      }, this.all);
    },
    byType() {
      const sources = Object.values(this.all).reduce((acc, source) => {
        const container = acc.find((obj) => obj.title === source.type);
        if (!container) {
          acc.push({
            title: source.type,
            sources: [source],
          });
        } else {
          container.sources.push(source);
        }
        return acc;
      }, []);

      const order = [
        "Official",
        "Official Adventure",
        "Official Web Supplement",
        "Third-Party",
        "Community",
      ];

      sources.sort((a, b) => {
        return order.indexOf(a.type) - order.indexOf(b.type);
      });

      return sources;
    },
  },
});

import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import { versionCompare } from "../js/helpers";
import Monster from "../js/monster";

export const useSources = defineStore("sources", {
  state: () => {
    return {
      version: "2.1.0",
      storedVersion: useLocalStorage("stored_sources_version", ""),

      builtIn: useLocalStorage("sources", []),
      imported: useLocalStorage("imported_sources", []),
    };
  },

  hydrate(storeState, initialState) {
    storeState.builtIn = useLocalStorage("sources", []);
    storeState.imported = useLocalStorage("imported_sources", []);
    storeState.storedVersion = useLocalStorage("stored_sources_version", "");
  },

  actions: {
    find(name) {
      return this.all.filter((source) => source.name === name)[0] ?? null;
    },

    async fetch() {
      // if (
      //   this.builtIn.length &&
      //   versionCompare(this.version, this.storedVersion) === 0
      // ) {
      //   return this.builtIn;
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

      this.builtIn = this.builtIn.length
        ? fetched.map((newSource) => {
            const foundOldSource = this.enabled.find((oldSource) => {
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

      return this.builtIn;
    },
  },

  getters: {
    all() {
      return this.builtIn.concat(this.imported);
    },
    includeSources(sources) {
      this.imported = this.imported.concat(sources);
    },
    enabled() {
      return this.all.filter((source) => !!source.enabled);
    },
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

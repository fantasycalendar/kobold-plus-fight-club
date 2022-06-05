import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core/index";
import { versionCompare } from "../js/helpers";
import Monster from "../js/monster";

export const useSources = defineStore("sources", {
  state: () => {
    return {
      version: "2.1.0",
      storedVersion: useLocalStorage("stored_sources_version", "2.1.0"),

      builtIn: useLocalStorage("sources", []),
      imported: useLocalStorage("imported_sources", []),
    };
  },
  actions: {
    find(name) {
      return this.all.find((source) => source.name === name);
    },

    async fetch() {
      if (
        this.builtIn.length &&
        versionCompare(this.version, this.storedVersion) === 0
      ) {
        return this.builtIn;
      }

      // this.storedVersion = this.version;

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

      this.builtIn = fetched.map((newSource) => {
        const foundOldSource = this.builtIn.find((oldSource) => {
          return newSource["name"] === oldSource["name"];
        });

        newSource.enabled = foundOldSource
          ? foundOldSource.enabled
          : !!newSource.default;

        return newSource;
      });

      return this.builtIn;
    },
    includeSources(sources) {
      this.imported = this.imported.concat(sources);
    },
  },

  getters: {
    all() {
      return [...this.builtIn, ...this.imported];
    },
    import(sources) {
      this.imported = [...this.import, ...sources];
    },
    enabled() {
      return this.all.filter((source) => !!source.enabled);
    },
    byType() {
      const sources = this.all.reduce((acc, source) => {
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

import CONST from "./constants.js";
import * as helpers from "./helpers.js";
import { useSources } from "../stores/sources";
import { useMonsters } from "../stores/monsters.js";

export default class Monster {
  constructor(attributes) {
    this.attributes = attributes;
    this.cr = CONST.CR[attributes.cr];

    this.name = attributes.name;
    this.type = attributes.type;
    this.size = attributes.size;
    this.hp = attributes.hp;
    this.environment = attributes.environment.toLowerCase();
    this.isUnique = !!attributes["unique?"] || !!attributes["unique"];
    this.lair = !!attributes["lair"] || !!attributes["lair?"];

    this.slug = helpers.slugify(
      attributes.name + "-" + attributes.sources + "-" + this.cr.string
    );

    this.tags = attributes.tags
      ? attributes.tags.split(/\s*,\s*/)
      : [];

    this.special = !!attributes.special;
    this.legendary = !!attributes.legendary;
    this.unique = !!attributes.unique;
    this.alignment = attributes.alignment
      ? Monster.parseAlignment(attributes.alignment)
      : "";

    this.searchable = [
      this.attributes.name,
      this.attributes.section,
      this.attributes.type,
      this.attributes.size,
      this.attributes.alignment ? this.alignment.text : "",
      this.attributes.cr.string,
    ]
      .concat(this.tags)
      .join("|")
      .toLowerCase();

    const sources = useSources();
    this.sources = this.attributes.sources.split(", ").map((str) => {
      let book = str;
      let location = "";
      let hasPageNumber = false;

      if (str.includes(": ")) {
        const colonIndex = str.lastIndexOf(": ");
        const afterColon = str.slice(colonIndex + 2);

        hasPageNumber = !isNaN(afterColon);

        if (hasPageNumber || helpers.isValidHttpUrl(afterColon)) {
          book = str.slice(0, colonIndex);
          location = afterColon;
        }
      }

      let reference = sources.find(book);
      return {
        actual_source: reference,
        reference: {
          ...reference,
          ...(helpers.isValidHttpUrl(location) && { link: location }),
        },
        fullText: reference.name + (hasPageNumber ? " p." + location : ""),
      };
    });

    this.sources.sort((a, b) =>
      a.fullText.localeCompare(b.fullText, "en", { sensitivity: "base" })
    );
  }

  static make(attributes) {
    const cr = CONST.CR[attributes.cr];
    const slug = helpers.slugify(
      attributes.name + "-" + attributes.sources + "-" + cr.string
    );
    if(useMonsters().lookup[slug]) return false;
    return new Monster(attributes);
  }

  get sourceEnabled() {
    return this.sources.find((source) => source.actual_source.enabled);
  }

  filter(key, filters) {
    if(Array.isArray(this[key])) return this.filterArray(key, filters);
    const positiveFilters = filters.filter(filter => !filter.startsWith("not-"));
    const negativeFilters = filters.filter(filter => filter.startsWith("not-"));
    let result = positiveFilters.length ? positiveFilters.includes(this[key].toLowerCase()) : true;
    if(negativeFilters.length){
      result = result && !negativeFilters.map(size => size.split("-")[1]).includes(this[key].toLowerCase());
    }
    return result;
  }

  filterArray(key, filters){
    const positiveFilters = filters.filter(filter => !filter.startsWith("not-"));
    const negativeFilters = filters.filter(filter => filter.startsWith("not-"));
    let result = positiveFilters.length ? positiveFilters.find(filter => this[key].includes(filter.toLowerCase())) : true;
    if(negativeFilters.length){
      return result && !negativeFilters.map(size => size.split("-")[1]).find(filter => this[key].includes(filter.toLowerCase()));
    }
    return result;
  }

  static parseAlignment(str = "") {
    return {
      string: str,
      bits: str.split(/\s*(,|or|,\s*or)\s*/i).reduce((total, alignment) => {
        return (
          total |
          (CONST.ALIGNMENT_TEST_ORDER.find(function (alignmentDefinition) {
            return alignment.match(alignmentDefinition.regex);
          })?.bits ?? CONST.ALIGNMENTS.UNALIGNED.bits)
        );
      }, 0),
    };
  }
}

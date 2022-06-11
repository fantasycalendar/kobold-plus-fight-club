import CONST from "./constants.js";
import * as helpers from "./helpers.js";
import { useSources } from "../stores/sources";

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

    if(!this.cr) {
      console.log(attributes);
    }

    this.slug = helpers.slugify(
      attributes.name + "-" + attributes.sources + "-" + this.cr.string
    );

    this.tags = attributes.tags
      ? attributes.tags.split(/\s*,\s*/).sort()
      : null;

    this.special = !!attributes.special;
    this.legendary = !!attributes.legendary;
    this.lair = !!attributes.lair;
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
      const [book, location] = str.split(": ");
      let source = {};
      source.actual_source = sources.find(book);

      if (!isNaN(Number(location))) {
        source.reference = source.actual_source;
        source.page = location;
      } else if (helpers.isValidHttpUrl(location)) {
        source.reference = {
          name: book,
          shortname: book,
          link: location,
        };
      }

      source.fullText =
        source.reference.name + (source.page ? " p." + source.page : "");
      return source;
    });

    this.sources.sort((a, b) =>
      a.fullText.localeCompare(b.fullText, "en", { sensitivity: "base" })
    );
  }

  get sourceEnabled() {
    return this.sources.find((source) => source.actual_source.enabled);
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

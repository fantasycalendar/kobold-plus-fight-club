import { useLocalStorage } from "@vueuse/core/index";

export function migrateLocalStorage(newKey, oldKey, defaultValue) {
  let value = useLocalStorage(
    newKey,
    localStorage.getItem(oldKey) ?? defaultValue
  );

  if (typeof localStorage.getItem(oldKey) !== "undefined") {
    localStorage.removeItem(oldKey);
  }

  return value;
}

/**
 *  Returns a floating point number between a minimum and maximum value
 *
 * @param  {Number}     min                     The minimum value
 * @param  {Number}     max                     The maximum value
 * @return {Number}                             A random value between the range given
 */
export function randomFloatBetween(min, max) {
  const random = Math.random();
  const _max = Math.max(Number(max), Number(min));
  const _min = Math.min(Number(max), Number(min));
  return random * (_max - _min) + _min;
}

/**
 *  Returns an integer between a minimum and maximum value
 *
 * @param  {Number}     min                     The minimum value
 * @param  {Number}     max                     The maximum value
 * @return {Number}                             A random integer between the range given
 */
export function randomIntBetween(min, max) {
  return Math.floor(randomFloatBetween(min, max));
}

/**
 *  Returns a random element in the given array
 *
 * @param  {Array}   inArray                    An array
 * @param  {Boolean} recurse                    Whether to recurse if the randomly chosen element is also an array
 * @return {any}                                A random element from the array
 */
export function randomArrayElement(inArray, { recurse = false } = {}) {
  let choice = inArray[randomIntBetween(0, inArray.length)];
  if (recurse && Array.isArray(choice)) {
    return randomArrayElement(choice, { recurse: true });
  }
  return choice;
}

/**
 * Clones an object and returns a copy of it
 *
 * @param inObj
 * @return {any}
 */
export function clone(inObj) {
  return JSON.parse(JSON.stringify(inObj));
}

/**
 * Checks whether a string is
 *
 * @param {String} string
 * @return {boolean}
 */
export function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (err) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function ratio(start, end, value) {
  return (value - start) / (end - start);
}

export function slugify(str) {
  return str
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[-\s]+/g, "-");
}

export function versionCompare(v1, v2, options) {
  let lexicographical = options && options?.lexicographical,
    zeroExtend = options && options?.zeroExtend,
    v1parts = v1.split("."),
    v2parts = v2.split(".");

  function isValidPart(x) {
    return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  if (zeroExtend) {
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");
  }

  if (!lexicographical) {
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }

    if (v1parts[i] === v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length !== v2parts.length) {
    return -1;
  }

  return 0;
}

/**
 * Determines whether a string is actually valid JSON
 */
export function validateJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {}

  return false;
}

export function downloadFile(fileName, data, type) {
  const a = document.createElement("a");
  const file = new Blob([data], { type: type });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  a.remove();
}

export function formatNumber(num) {
  if (!num) return 0;
  return new Intl.NumberFormat("en-US").format(num);
}

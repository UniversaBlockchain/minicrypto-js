exports.chr = chr;
exports.ord = ord;
exports.isNone = isNone;

/**
 * Returns true if value equals null or undefined
 *
 * @param  {*}        value
 * @return {Boolean}
 */
function isNone(value) {
  return value === null || value === undefined;
}

/**
 * Returns a string containing the character represented
 * by the receiver’s value according to encoding.
 *
 *  For example:
 *    chr(65) // => 'A'
 *
 * @param  {Number} value
 * @return {String}
 */
function chr(value) {
  return String.fromCodePoint(value[0]);
}

/**
 * Returns ASCII code of the first symbol of value
 *
 * @param  {*} value
 * @return {Number}
 */
function ord(value) {
  return value && value.toString().charCodeAt(0);
}

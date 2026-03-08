/**
 * Utility for binary conversion
 */

/**
 * Converts a string to its binary representation.
 * @param {string} text
 * @returns {string} Binary string
 */
function textToBinary(text) {
  return text
    .split("")
    .map((char) => {
      return char.charCodeAt(0).toString(2).padStart(8, "0");
    })
    .join("");
}

/**
 * Converts a binary string back to text.
 * @param {string} binary
 * @returns {string} Text string
 */
function binaryToText(binary) {
  let text = "";
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
}

module.exports = {
  textToBinary,
  binaryToText,
};

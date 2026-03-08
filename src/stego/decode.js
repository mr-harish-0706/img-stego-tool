const { extractLSB } = require("./lsb");
const { decryptMessage } = require("../crypto/decrypt");
const { binaryToText } = require("../utils/binary");

/**
 * Full decoding workflow.
 * @param {string} imagePath
 * @param {string} password
 * @returns {Promise<string>}
 */
async function decodeMessage(imagePath, password) {
  const binary = await extractLSB(imagePath);
  const text = binaryToText(binary);
  return decryptMessage(text, password);
}

module.exports = { decodeMessage };

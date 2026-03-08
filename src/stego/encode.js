const { embedLSB } = require("./lsb");
const { encryptMessage } = require("../crypto/encrypt");
const { textToBinary } = require("../utils/binary");

/**
 * Full encoding workflow.
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {string} message
 * @param {string} password
 */
async function encodeMessage(inputPath, outputPath, message, password) {
  const encrypted = encryptMessage(message, password);
  const binary = textToBinary(encrypted);
  await embedLSB(inputPath, outputPath, binary);
}

module.exports = { encodeMessage };

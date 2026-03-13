const pako = require("pako");
const { extractLSB } = require("./lsb");
const { decryptMessage } = require("../crypto/decrypt");
const { fromBitArray } = require("../utils/binary");

/**
 * Full decoding workflow.
 * @param {string} imagePath
 * @param {string} password
 * @returns {Promise<object>} { type, filename, message }
 */
async function decodeMessage(imagePath, password) {
  const bits = await extractLSB(imagePath);
  const fullPayload = fromBitArray(bits).toString("utf8");

  if (!fullPayload.startsWith("IMGSTEGO_V1|")) {
    // Legacy support
    try {
      return { type: "text", message: decryptMessage(fullPayload, password) };
    } catch (e) {
      throw new Error("Invalid format or corrupted data");
    }
  }

  const parts = fullPayload.split("|");
  if (parts.length < 4) throw new Error("Corrupted metadata header");

  const type = parts[1];
  const filename = parts[2];
  const encrypted = parts.slice(3).join("|");

  // 1. Decrypt
  const compressedBase64 = decryptMessage(encrypted, password);

  // 2. Decompress
  try {
    const compressedData = Buffer.from(compressedBase64, "base64");
    const originalData = pako.inflate(compressedData);

    let resultMessage;
    if (type === "text") {
      resultMessage = Buffer.from(originalData).toString("utf8");
    } else {
      // File data stays as base64 for main process to save
      resultMessage = Buffer.from(originalData).toString("base64");
    }

    return { type, filename, message: resultMessage };
  } catch (e) {
    throw new Error(
      "Decompression failed. Possibly wrong password or corrupted data.",
    );
  }
}

module.exports = { decodeMessage };

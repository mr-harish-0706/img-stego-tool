const pako = require("pako");
const fs = require("fs");
const { embedLSB } = require("./lsb");
const { encryptMessage } = require("../crypto/encrypt");
const { toBitArray } = require("../utils/binary");

/**
 * Full encoding workflow.
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {string} payload - Text message or "FILE_PATH:..."
 * @param {string} password
 * @param {object} options - { type: 'text'|'file', filename: string }
 */
async function encodeMessage(
  inputPath,
  outputPath,
  payload,
  password,
  options = { type: "text" },
) {
  let dataBuffer;

  if (payload.startsWith("FILE_PATH:")) {
    const filePath = payload.replace("FILE_PATH:", "");
    try {
      dataBuffer = fs.readFileSync(filePath);
    } catch (e) {
      throw new Error("Failed to read file for hiding: " + e.message);
    }
  } else {
    dataBuffer = Buffer.from(payload, "utf8");
  }

  // 1. Compress
  const compressed = pako.deflate(dataBuffer);

  // 2. Encrypt
  // CryptoJS works with strings well, so we convert compressed bits to base64 first
  const compressedBase64 = Buffer.from(compressed).toString("base64");
  const encrypted = encryptMessage(compressedBase64, password);

  // 3. Add Metadata
  const meta = `IMGSTEGO_V1|${options.type}|${options.filename || ""}|`;
  const finalPayload = meta + encrypted;

  // 4. Convert to bits and embed
  const bits = toBitArray(finalPayload);
  await embedLSB(inputPath, outputPath, bits);
}

module.exports = { encodeMessage };

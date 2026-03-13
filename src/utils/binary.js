/**
 * Utility for binary conversion using Buffers for performance
 */

/**
 * Converts a string or Buffer to a bit array (Uint8Array of 0s and 1s)
 * @param {string|Buffer} data
 * @returns {Uint8Array}
 */
function toBitArray(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
  const bits = new Uint8Array(buf.length * 8);
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    for (let j = 0; j < 8; j++) {
      bits[i * 8 + j] = (byte >> (7 - j)) & 1;
    }
  }
  return bits;
}

/**
 * Converts a bit array (Uint8Array of 0s and 1s) back to a Buffer
 * @param {Uint8Array} bits
 * @returns {Buffer}
 */
function fromBitArray(bits) {
  const byteCount = Math.floor(bits.length / 8);
  const buf = Buffer.alloc(byteCount);
  for (let i = 0; i < byteCount; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i * 8 + j];
    }
    buf[i] = byte;
  }
  return buf;
}

module.exports = {
  toBitArray,
  fromBitArray,
  // Keep old names for compatibility during migration if needed
  textToBinary: (text) => Array.from(toBitArray(text)).join(""),
  binaryToText: (bin) =>
    fromBitArray(
      new Uint8Array(bin.split("").map((b) => parseInt(b))),
    ).toString("utf8"),
};

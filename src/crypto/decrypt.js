const CryptoJS = require("crypto-js");

/**
 * Decrypts an AES encrypted message.
 * @param {string} cipherText
 * @param {string} password
 * @returns {string} Decrypted message
 */
function decryptMessage(cipherText, password) {
  if (!password) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) throw new Error("Invalid password or corrupted data");
    return originalText;
  } catch (error) {
    throw new Error("Decryption failed: " + error.message);
  }
}

module.exports = { decryptMessage };

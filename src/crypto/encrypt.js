const CryptoJS = require("crypto-js");

/**
 * Encrypts a message using AES.
 * @param {string} message
 * @param {string} password
 * @returns {string} Encrypted message (base64)
 */
function encryptMessage(message, password) {
  if (!password) return message;
  return CryptoJS.AES.encrypt(message, password).toString();
}

module.exports = { encryptMessage };

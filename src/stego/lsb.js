const fs = require("fs");
const { PNG } = require("pngjs");
const { textToBinary, binaryToText } = require("../utils/binary");

/**
 * Embeds a binary string into the LSB of image pixels.
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {string} binaryMessage
 * @returns {Promise<void>}
 */
function embedLSB(inputPath, outputPath, binaryMessage) {
  return new Promise((resolve, reject) => {
    // Add a delimiter to know when the message ends (e.g., 32 null bits)
    const delimiter = "00000000".repeat(4);
    const fullMessage = binaryMessage + delimiter;

    fs.createReadStream(inputPath)
      .pipe(new PNG())
      .on("parsed", function () {
        if (fullMessage.length > this.width * this.height * 3) {
          return reject(new Error("Message too large for this image."));
        }

        let bitIndex = 0;
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            // Modify R, G, B channels
            for (let c = 0; c < 3; c++) {
              if (bitIndex < fullMessage.length) {
                const bit = parseInt(fullMessage[bitIndex]);
                // Clear last bit and set to message bit
                this.data[idx + c] = (this.data[idx + c] & 0xfe) | bit;
                bitIndex++;
              }
            }
          }
        }

        this.pack()
          .pipe(fs.createWriteStream(outputPath))
          .on("finish", resolve)
          .on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Extracts a binary string from the LSB of image pixels.
 * @param {string} imagePath
 * @returns {Promise<string>} Binary string
 */
function extractLSB(imagePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(imagePath)
      .pipe(new PNG())
      .on("parsed", function () {
        let binaryMessage = "";
        const delimiter = "00000000".repeat(4);

        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            for (let c = 0; c < 3; c++) {
              binaryMessage += (this.data[idx + c] & 1).toString();

              // Check for delimiter every byte
              if (
                binaryMessage.length % 8 === 0 &&
                binaryMessage.endsWith(delimiter)
              ) {
                return resolve(binaryMessage.slice(0, -delimiter.length));
              }
            }
          }
        }
        resolve(binaryMessage); // Return what we found reached end
      })
      .on("error", reject);
  });
}

module.exports = { embedLSB, extractLSB };

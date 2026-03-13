const fs = require("fs");
const { PNG } = require("pngjs");

/**
 * Embeds a bit array into the LSB of image pixels.
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {Uint8Array} bits
 * @returns {Promise<void>}
 */
function embedLSB(inputPath, outputPath, bits) {
  return new Promise((resolve, reject) => {
    // Add 32 null bits as delimiter
    const fullBits = new Uint8Array(bits.length + 32);
    fullBits.set(bits);

    fs.createReadStream(inputPath)
      .pipe(new PNG())
      .on("parsed", function () {
        if (fullBits.length > this.width * this.height * 3) {
          return reject(new Error("Message too large for this image."));
        }

        let bitIndex = 0;
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            for (let c = 0; c < 3; c++) {
              if (bitIndex < fullBits.length) {
                const bit = fullBits[bitIndex];
                this.data[idx + c] = (this.data[idx + c] & 0xfe) | bit;
                bitIndex++;
              }
            }
            if (bitIndex >= fullBits.length) break;
          }
          if (bitIndex >= fullBits.length) break;
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
 * Extracts a bit array from the LSB of image pixels.
 * @param {string} imagePath
 * @returns {Promise<Uint8Array>} Bit array
 */
function extractLSB(imagePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(imagePath)
      .pipe(new PNG())
      .on("parsed", function () {
        const totalPixels = this.width * this.height;
        const allBits = new Uint8Array(totalPixels * 3);
        let bitCount = 0;
        let zeroBitCount = 0;

        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;

            for (let c = 0; c < 3; c++) {
              const bit = this.data[idx + c] & 1;
              allBits[bitCount++] = bit;

              if (bit === 0) {
                zeroBitCount++;
              } else {
                zeroBitCount = 0;
              }

              // Check for 32 consecutive zero bits (4 null bytes)
              if (zeroBitCount >= 32 && bitCount % 8 === 0) {
                return resolve(allBits.slice(0, bitCount - 32));
              }
            }
          }
        }
        resolve(allBits.slice(0, bitCount));
      })
      .on("error", reject);
  });
}

module.exports = { embedLSB, extractLSB };

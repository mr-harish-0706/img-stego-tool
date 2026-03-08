# 🖼️ ImgStego

A modern, secure desktop steganography application that allows you to hide secret messages inside PNG images using the **Least Significant Bit (LSB)** technique.

Protect your privacy by embedding encrypted messages directly into image pixels, making them invisible to the naked eye.

---

## 🚀 Features

- **Double Security**: Encrypt messages with **AES-256** before hiding them.
- **Stealth Mode**: Uses LSB steganography to ensure zero visual difference in the carrier image.
- **User-Friendly UI**: Simple tabbed interface for encoding and decoding.
- **Offline First**: Works entirely on your local machine—no data leaves your computer.
- **Cross-Platform**: Built with Electron for Windows, macOS, and Linux support.

---

## 🛠️ Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) (Desktop Environment)
- **Logic**: Node.js & Vanilla JavaScript
- **Styling**: Vanilla CSS (Modern UI)
- **Image Processing**: [pngjs](https://www.npmjs.com/package/pngjs) (Pixel-perfect manipulation)
- **Encryption**: [crypto-js](https://www.npmjs.com/package/crypto-js) (AES-256 encryption)

---

## 📖 How to Use

### 📥 Encoding (Hiding a Message)

1. **Launch** the application.
2. Select the **Encode** tab.
3. Click **"Select Image"** to choose a base PNG image.
4. Enter your **Secret Message** in the text area.
5. (Optional) Enter a **Password** to encrypt the message.
6. Click **"Encode & Save"** and choose where to save your new stego-image.

### 📤 Decoding (Extracting a Message)

1. Select the **Decode** tab.
2. Click **"Select Image"** to choose the PNG containing a hidden message.
3. Enter the **Password** (if one was used during encoding).
4. Click **"Extract Message"**.
5. Your secret message will appear in the output area below.

---

## 📁 Project Structure

```text
imgstego/
├── src/
│   ├── main/          # Electron main process (lifecycle & IPC)
│   ├── renderer/      # Frontend logic, UI, and styles
│   ├── stego/         # Core LSB encoding/decoding algorithms
│   ├── crypto/        # AES-256 encryption/decryption utilities
│   └── utils/         # Helper functions (binary conversion, etc.)
├── assets/            # UI icons and static assets
└── screenshots/       # Visual previews of the app
```

---

## ⚙️ Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/mr-harish-0706/img-stego-tool.git
   cd img-stego-tool
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the app**:
   ```bash
   npm start
   ```

---

## 📜 License

This project is licensed under the ISC License.

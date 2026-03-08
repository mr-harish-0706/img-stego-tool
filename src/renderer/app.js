// Tab Switching Logic
const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// State Management
let encodeInputPath = "";
let decodeImagePath = "";

// UI Elements - Encode
const selectImageEncodeBtn = document.getElementById("select-image-encode");
const selectedPathEncode = document.getElementById("selected-path-encode");
const messageInput = document.getElementById("message-input");
const passwordEncodeInput = document.getElementById("password-encode");
const encodeBtn = document.getElementById("encode-btn");
const encodeStatus = document.getElementById("encode-status");

// UI Elements - Decode
const selectImageDecodeBtn = document.getElementById("select-image-decode");
const selectedPathDecode = document.getElementById("selected-path-decode");
const passwordDecodeInput = document.getElementById("password-decode");
const decodeBtn = document.getElementById("decode-btn");
const decodeStatus = document.getElementById("decode-status");
const decodedOutput = document.getElementById("decoded-output");

// Encode Handlers
selectImageEncodeBtn.addEventListener("click", async () => {
  const path = await window.electronAPI.selectFile();
  if (path) {
    encodeInputPath = path;
    selectedPathEncode.textContent = path.split(/[\\/]/).pop();
  }
});

encodeBtn.addEventListener("click", async () => {
  if (!encodeInputPath)
    return showStatus(encodeStatus, "Please select an image", "error");
  if (!messageInput.value)
    return showStatus(encodeStatus, "Please enter a message", "error");

  encodeBtn.disabled = true;
  showStatus(encodeStatus, "Processing...", "");

  const outputPath = await window.electronAPI.saveFile();
  if (!outputPath) {
    encodeBtn.disabled = false;
    return showStatus(encodeStatus, "Operation cancelled", "");
  }

  const result = await window.electronAPI.encode({
    inputPath: encodeInputPath,
    outputPath,
    message: messageInput.value,
    password: passwordEncodeInput.value,
  });

  encodeBtn.disabled = false;
  if (result.success) {
    showStatus(encodeStatus, "Message encoded successfully!", "success");
  } else {
    showStatus(encodeStatus, "Error: " + result.error, "error");
  }
});

// Decode Handlers
selectImageDecodeBtn.addEventListener("click", async () => {
  const path = await window.electronAPI.selectFile();
  if (path) {
    decodeImagePath = path;
    selectedPathDecode.textContent = path.split(/[\\/]/).pop();
  }
});

decodeBtn.addEventListener("click", async () => {
  if (!decodeImagePath)
    return showStatus(decodeStatus, "Please select an image", "error");

  decodeBtn.disabled = true;
  showStatus(decodeStatus, "Extracting...", "");

  const result = await window.electronAPI.decode({
    imagePath: decodeImagePath,
    password: passwordDecodeInput.value,
  });

  decodeBtn.disabled = false;
  if (result.success) {
    decodedOutput.textContent = result.message;
    showStatus(decodeStatus, "Extraction complete!", "success");
  } else {
    decodedOutput.textContent = "Decryption failed.";
    showStatus(decodeStatus, "Error: " + result.error, "error");
  }
});

// Utility Functions
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = "status-msg " + type;
}

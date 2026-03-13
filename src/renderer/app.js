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
let hiddenFilePath = "";
let currentMode = "text"; // 'text' or 'file'

// UI Elements - Common
const showStatus = (element, message, type) => {
  element.textContent = message;
  element.className = "status-msg " + type;
};

// UI Elements - Encode
const dropZoneEncode = document.getElementById("drop-zone-encode");
const selectImageEncodeBtn = document.getElementById("select-image-encode");
const selectedImageInfoEncode = document.getElementById(
  "selected-image-info-encode",
);
const selectedPathEncode = document.getElementById("selected-path-encode");
const imageCapacity = document.getElementById("image-capacity");

const modeTextBtn = document.getElementById("mode-text");
const modeFileBtn = document.getElementById("mode-file");
const textInputGroup = document.getElementById("text-input-group");
const fileInputGroup = document.getElementById("file-input-group");

const messageInput = document.getElementById("message-input");
const charCountDisplay = document.getElementById("char-count");
const selectHiddenFileBtn = document.getElementById("select-hidden-file");
const selectedHiddenFileName = document.getElementById(
  "selected-hidden-file-name",
);

const passwordEncodeInput = document.getElementById("password-encode");
const encodeBtn = document.getElementById("encode-btn");
const encodeProgressBar = document.getElementById("encode-progress-bar");
const encodeProgressContainer = document.getElementById(
  "encode-progress-container",
);
const encodeStatus = document.getElementById("encode-status");

// UI Elements - Decode
const dropZoneDecode = document.getElementById("drop-zone-decode");
const selectImageDecodeBtn = document.getElementById("select-image-decode");
const selectedPathDecode = document.getElementById("selected-path-decode");
const passwordDecodeInput = document.getElementById("password-decode");
const decodeBtn = document.getElementById("decode-btn");
const decodeProgressBar = document.getElementById("decode-progress-bar");
const decodeProgressContainer = document.getElementById(
  "decode-progress-container",
);
const decodeStatus = document.getElementById("decode-status");
const decodedOutput = document.getElementById("decoded-output");
const downloadExtractedFileBtn = document.getElementById(
  "download-extracted-file",
);
const reloadBtn = document.getElementById("reload-btn");

// Reload Application
reloadBtn.addEventListener("click", () => {
  window.electronAPI.reload();
});

// Mode Switching
modeTextBtn.addEventListener("click", () => {
  currentMode = "text";
  modeTextBtn.classList.add("active");
  modeFileBtn.classList.remove("active");
  textInputGroup.classList.remove("hidden");
  fileInputGroup.classList.add("hidden");
});

modeFileBtn.addEventListener("click", () => {
  currentMode = "file";
  modeFileBtn.classList.add("active");
  modeTextBtn.classList.remove("active");
  fileInputGroup.classList.remove("hidden");
  textInputGroup.classList.add("hidden");
});

// Drag & Drop Handlers - Global prevention to avoid browser navigation
window.addEventListener("dragover", (e) => e.preventDefault(), false);
window.addEventListener("drop", (e) => e.preventDefault(), false);

const setupDragDrop = (zone, callback) => {
  ["dragenter", "dragover"].forEach((eventName) => {
    zone.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add("drag-over");
      },
      false,
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    zone.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove("drag-over");
      },
      false,
    );
  });

  zone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Use webUtils.getPathForFile (via preload) for Electron 32 compatibility
      const path = window.electronAPI.getFilePath(files[0]);
      callback(path);
    }
  });

  zone.addEventListener("click", () => {
    // Buttons handle clicks
  });
};

const handleEncodeImageSelected = async (path) => {
  if (!path || !path.toLowerCase().endsWith(".png")) {
    showStatus(encodeStatus, "Please select a PNG image.", "error");
    return;
  }
  encodeInputPath = path;
  selectedPathEncode.textContent = path.split(/[\\/]/).pop();
  selectedImageInfoEncode.classList.remove("hidden");

  // Calculate Capacity
  const img = new Image();
  img.src = `file://${path}`;
  img.onload = () => {
    const capacity = Math.floor((img.width * img.height * 3) / 8); // 3 bits per pixel (RGB)
    imageCapacity.textContent = `Capacity: ~${capacity.toLocaleString()} chars`;
  };
};

const handleDecodeImageSelected = (path) => {
  decodeImagePath = path;
  selectedPathDecode.textContent = path.split(/[\\/]/).pop();
};

setupDragDrop(dropZoneEncode, handleEncodeImageSelected);
setupDragDrop(dropZoneDecode, handleDecodeImageSelected);

// Button Handlers
selectImageEncodeBtn.addEventListener("click", async () => {
  const path = await window.electronAPI.selectFile([
    { name: "Images", extensions: ["png"] },
  ]);
  if (path) handleEncodeImageSelected(path);
});

selectImageDecodeBtn.addEventListener("click", async () => {
  const path = await window.electronAPI.selectFile([
    { name: "Images", extensions: ["png"] },
  ]);
  if (path) handleDecodeImageSelected(path);
});

selectHiddenFileBtn.addEventListener("click", async () => {
  const path = await window.electronAPI.selectFile([
    { name: "All Files", extensions: ["*"] },
  ]);
  if (path) {
    hiddenFilePath = path;
    selectedHiddenFileName.textContent = path.split(/[\\/]/).pop();
  }
});

// Encode logic
encodeBtn.addEventListener("click", async () => {
  if (!encodeInputPath)
    return showStatus(encodeStatus, "Please select an image", "error");

  let payload = "";
  let options = { type: currentMode, filename: "" };

  if (currentMode === "text") {
    if (!messageInput.value)
      return showStatus(encodeStatus, "Please enter a message", "error");
    payload = messageInput.value;
  } else {
    if (!hiddenFilePath)
      return showStatus(encodeStatus, "Please select a file to hide", "error");
    payload = "FILE_PATH:" + hiddenFilePath;
    options.filename = hiddenFilePath.split(/[\\/]/).pop();
  }

  encodeBtn.disabled = true;
  encodeProgressContainer.classList.remove("hidden");
  encodeProgressBar.style.width = "30%";
  showStatus(encodeStatus, "Optimizing & Encrypting...", "");

  const outputPath = await window.electronAPI.saveFile([
    { name: "Images", extensions: ["png"] },
  ]);
  if (!outputPath) {
    encodeBtn.disabled = false;
    encodeProgressContainer.classList.add("hidden");
    return showStatus(encodeStatus, "Operation cancelled", "");
  }

  encodeProgressBar.style.width = "60%";
  const result = await window.electronAPI.encode({
    inputPath: encodeInputPath,
    outputPath,
    message: payload,
    password: passwordEncodeInput.value,
    options,
  });

  encodeProgressBar.style.width = "100%";
  encodeBtn.disabled = false;

  setTimeout(() => {
    encodeProgressContainer.classList.add("hidden");
    if (result.success) {
      showStatus(encodeStatus, "Successfully hidden and saved!", "success");
    } else {
      showStatus(encodeStatus, "Error: " + result.error, "error");
    }
  }, 500);
});

// Decode Logic
let extractedFileContent = null;
let extractedFileName = "";

decodeBtn.addEventListener("click", async () => {
  if (!decodeImagePath)
    return showStatus(decodeStatus, "Please select an image", "error");

  decodeBtn.disabled = true;
  decodeProgressContainer.classList.remove("hidden");
  decodeProgressBar.style.width = "50%";
  showStatus(decodeStatus, "Extracting & Decrypting...", "");

  const result = await window.electronAPI.decode({
    imagePath: decodeImagePath,
    password: passwordDecodeInput.value,
  });

  decodeProgressBar.style.width = "100%";
  decodeBtn.disabled = false;

  setTimeout(() => {
    decodeProgressContainer.classList.add("hidden");
    if (result.success) {
      if (result.type === "file") {
        extractedFileContent = result.message; // Base64
        extractedFileName = result.filename;
        decodedOutput.textContent = `File extracted: ${extractedFileName}\nReady for download.`;
        downloadExtractedFileBtn.classList.remove("hidden");
      } else {
        decodedOutput.textContent = result.message;
        downloadExtractedFileBtn.classList.add("hidden");
      }
      showStatus(decodeStatus, "Extraction successful!", "success");
    } else {
      decodedOutput.textContent = "Extraction failed.";
      showStatus(decodeStatus, "Error: " + result.error, "error");
    }
  }, 500);
});

// Download Logic
downloadExtractedFileBtn.addEventListener("click", async () => {
  if (!extractedFileContent) return;

  const result = await window.electronAPI.saveBuffer({
    content: extractedFileContent,
    defaultName: extractedFileName,
  });

  if (result.success) {
    showStatus(decodeStatus, "File saved successfully!", "success");
  } else {
    showStatus(decodeStatus, "Failed to save file.", "error");
  }
});

// Stats
messageInput.addEventListener("input", () => {
  charCountDisplay.textContent = `${messageInput.value.length} characters`;
});

const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const { encodeMessage } = require("../stego/encode");
const { decodeMessage } = require("../stego/decode");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Desktop Steganography Toolkit",
    backgroundColor: "#0f172a",
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
}

// ... existing code ...

ipcMain.on("reload-app", () => {
  if (mainWindow) mainWindow.reload();
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// IPC Handlers
ipcMain.handle("select-file", async (event, filters) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: filters || [{ name: "Images", extensions: ["png"] }],
  });
  return result.filePaths[0];
});

ipcMain.handle("save-file", async (event, filters) => {
  const result = await dialog.showSaveDialog({
    filters: filters || [{ name: "Images", extensions: ["png"] }],
    defaultPath: "stego_image.png",
  });
  return result.filePath;
});

ipcMain.handle(
  "encode",
  async (event, { inputPath, outputPath, message, password, options }) => {
    try {
      await encodeMessage(inputPath, outputPath, message, password, options);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("decode", async (event, { imagePath, password }) => {
  try {
    const result = await decodeMessage(imagePath, password);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
ipcMain.handle("save-buffer", async (event, { content, defaultName }) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName || "extracted_file",
  });
  if (result.filePath) {
    const fs = require("fs");
    fs.writeFileSync(result.filePath, Buffer.from(content, "base64"));
    return { success: true };
  }
  return { success: false };
});

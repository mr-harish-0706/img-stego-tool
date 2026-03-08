const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { encodeMessage } = require("../stego/encode");
const { decodeMessage } = require("../stego/decode");

function createWindow() {
  const mainWindow = new BrowserWindow({
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

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// IPC Handlers
ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png"] }],
  });
  return result.filePaths[0];
});

ipcMain.handle("save-file", async () => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: "Images", extensions: ["png"] }],
    defaultPath: "stego_image.png",
  });
  return result.filePath;
});

ipcMain.handle(
  "encode",
  async (event, { inputPath, outputPath, message, password }) => {
    try {
      await encodeMessage(inputPath, outputPath, message, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
);

ipcMain.handle("decode", async (event, { imagePath, password }) => {
  try {
    const message = await decodeMessage(imagePath, password);
    return { success: true, message };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

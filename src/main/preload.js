const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: (filters) => ipcRenderer.invoke("select-file", filters),
  saveFile: (filters) => ipcRenderer.invoke("save-file", filters),
  encode: (data) => ipcRenderer.invoke("encode", data),
  decode: (data) => ipcRenderer.invoke("decode", data),
  saveBuffer: (data) => ipcRenderer.invoke("save-buffer", data),
  reload: () => ipcRenderer.send("reload-app"),
  getFilePath: (file) => webUtils.getPathForFile(file),
});

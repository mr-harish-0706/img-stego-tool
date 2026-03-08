const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: () => ipcRenderer.invoke("select-file"),
  saveFile: () => ipcRenderer.invoke("save-file"),
  encode: (data) => ipcRenderer.invoke("encode", data),
  decode: (data) => ipcRenderer.invoke("decode", data),
});

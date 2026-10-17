// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("athena", {
    getStorageDirectory: () => ipcRenderer.invoke("get-storage-directory"),
    selectStorageDirectory: () => ipcRenderer.invoke("select-storage-directory")
});

// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("athena", {
    appVersion: "0.1.0"
});

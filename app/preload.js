// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("athena", {
    getStorageDirectory: () => ipcRenderer.invoke("get-storage-directory"),
    selectStorageDirectory: () => ipcRenderer.invoke("select-storage-directory"),
    startTimerOnMain: () => ipcRenderer.invoke("start-timer"),
    registerListenerForTimerTickFromMain: (callback) => {
        const handler = (_event, seconds) => callback(seconds);
        ipcRenderer.on("timer", handler);
        return () => ipcRenderer.removeListener("timer", handler);
    }
});

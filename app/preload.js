// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("athena", {
    getStorageDirectory: () => ipcRenderer.invoke("get-storage-directory"),
    selectStorageDirectory: () => ipcRenderer.invoke("select-storage-directory"),
    startTimerOnMain: () => ipcRenderer.invoke("start-timer"),
    storeCameraSnapImageOnDisk: (data) => ipcRenderer.invoke("store-camera-snap-image-on-disk", data),
    showRules: () => ipcRenderer.send("show-rules"),
    takeScreenShotNow: () => ipcRenderer.invoke("take-screen-shot-now"),
    registerListenerForTimerTickFromMain: (callback) => {
        const handler = (_event, seconds) => callback(seconds);
        ipcRenderer.on("timer", handler);
        return () => ipcRenderer.removeListener("timer", handler);
    },
    registerListenerForCameraSnapFromMain: (callback) => {
        const handler = () => callback();
        ipcRenderer.on("camera-shot", handler);
        return () => ipcRenderer.removeListener("camera-shot", handler);
    }
});

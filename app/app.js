// app.js
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";

let electronWindow = null;

function createWindow() {
    electronWindow = new BrowserWindow({
        height: 900,
        width: 1000,
        minWidth: 800,
        minHeight: 700,
        webPreferences: {
            devTools: true,
            preload: path.join(import.meta.dirname, "preload.js")
        }
    });

    electronWindow.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

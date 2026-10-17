// app.js
import { app, BrowserWindow, desktopCapturer, session, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";

let electronWindow = null;
let storageDirectory = path.join(import.meta.dirname, "snapshots");

function ensureDirectoryStructure(baseDir) {
    const cameraDir = path.join(baseDir, "camera");
    const screenDir = path.join(baseDir, "screen");
    for (const d of [baseDir, cameraDir, screenDir]) {
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d, { recursive: true });
        }
    }
}
ensureDirectoryStructure(storageDirectory);

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

    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
            if (sources && sources.length > 0) {
                callback({ video: sources[0], audio: 'loopback' });
            }
        });
    }, { useSystemPicker: true });

    electronWindow.loadURL("http://localhost:5173");
}

ipcMain.handle("get-storage-directory", () => {
    return storageDirectory;
});

ipcMain.handle("select-storage-directory", async () => {
    const response = await dialog.showOpenDialog(electronWindow, {
        title: "Select Snapshot Storage Directory",
        buttonLabel: "Select Folder",
        properties: ["openDirectory", "createDirectory"]
    });

    if (!response.canceled && response.filePaths.length > 0) {
        storageDirectory = response.filePaths[0];
        ensureDirectoryStructure(storageDirectory);
        return storageDirectory;
    }
    return storageDirectory;
});

app.whenReady().then(() => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// app.js
import { app, BrowserWindow, desktopCapturer, session } from "electron";
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

    // Handle screen sharing stream requests
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
            if (sources && sources.length > 0) {
                callback({ video: sources[0], audio: 'loopback' });
            }
        });
    }, { useSystemPicker: true });

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

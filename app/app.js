// app.js
import { app, BrowserWindow, desktopCapturer, session, ipcMain, dialog, Menu } from "electron";
import path from "path";
import fs from "fs";

let electronWindow = null;
let storageDirectory = path.join(import.meta.dirname, "snapshots");
let startTimestamp = null;
let timerInterval = null;
let snapshotInterval = null;

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

function createApplicationMenu() {
    const isMac = process.platform === "darwin";
    const template = [
        ...(isMac ? [{ label: app.name, submenu: [{ role: "about" }, { role: "quit" }] }] : []),
        {
            label: "File",
            submenu: [{ label: "Exit Exam", click: () => app.quit() }]
        },
        {
            label: "Edit",
            submenu: [{ role: "copy" }, { role: "paste" }]
        },
        {
            label: "View",
            submenu: [{ role: "reload" }, { role: "togglefullscreen" }]
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "Exam Rules & Guidelines",
                    click: () => showRulesDialog()
                }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showRulesDialog() {
    if (!electronWindow) return;
    dialog.showMessageBox(electronWindow, {
        type: "info",
        title: "Athena Exam Rules",
        message: "Examination Proctoring Guidelines",
        detail:
            "1. Remain on the examination screen throughout the test.
" +
            "2. Webcam and screen sharing must remain enabled.
" +
            "3. Copying content and unauthorized application switching is prohibited.
" +
            "4. Periodic snapshots of camera and desktop will be saved for audit.",
        buttons: ["I Understand and Agree"]
    });
}

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

    // Guardrail: Intercept Cmd/Ctrl + C copy attempts
    electronWindow.webContents.on("before-input-event", (event, input) => {
        if (input.type !== "keyDown") return;
        const isCtrlOrCmd = input.control || input.meta;
        const isCKey = input.key.toLowerCase() === "c";

        if (isCtrlOrCmd && isCKey) {
            event.preventDefault();
            dialog.showMessageBox(electronWindow, {
                type: "warning",
                title: "Action Restricted",
                message: "Copying is disabled during the proctored exam session.",
                detail: "Copying questions or exam content is recorded and flagged."
            });
        }
    });
}

async function takeScreenShot() {
    try {
        const sources = await desktopCapturer.getSources({
            types: ["screen"],
            thumbnailSize: { width: 1920, height: 1080 }
        });

        if (!sources || sources.length === 0) return;

        const primaryScreen = sources[0];
        const pngBuffer = primaryScreen.thumbnail.toPNG();

        const screenDir = path.join(storageDirectory, "screen");
        if (!fs.existsSync(screenDir)) {
            fs.mkdirSync(screenDir, { recursive: true });
        }

        const filePath = path.join(screenDir, `screen-${Date.now()}.png`);
        fs.writeFileSync(filePath, pngBuffer);
    } catch (error) {
        console.error("Failed to capture screen snapshot:", error);
    }
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

ipcMain.handle("store-camera-snap-image-on-disk", (_event, bufferData) => {
    try {
        const cameraDir = path.join(storageDirectory, "camera");
        if (!fs.existsSync(cameraDir)) {
            fs.mkdirSync(cameraDir, { recursive: true });
        }
        const filePath = path.join(cameraDir, `cam-${Date.now()}.jpg`);
        fs.writeFileSync(filePath, Buffer.from(bufferData));
        return filePath;
    } catch (err) {
        console.error("Failed to write camera snap:", err);
    }
});

ipcMain.handle("start-timer", () => {
    startTimestamp = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    if (snapshotInterval) clearInterval(snapshotInterval);

    timerInterval = setInterval(() => {
        if (electronWindow && !electronWindow.isDestroyed()) {
            const elapsed = (Date.now() - startTimestamp) / 1000;
            electronWindow.webContents.send("timer", elapsed);
        }
    }, 1000);

    snapshotInterval = setInterval(() => {
        if (electronWindow && !electronWindow.isDestroyed()) {
            electronWindow.webContents.send("camera-shot");
            takeScreenShot();
        }
    }, 5000);

    takeScreenShot();
});

ipcMain.on("show-rules", () => {
    showRulesDialog();
});

ipcMain.handle("take-screen-shot-now", async () => {
    await takeScreenShot();
});

app.whenReady().then(() => {
    createApplicationMenu();
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

# Athena Proctoring Tool

A secure, desktop-based proctoring application built with **Electron** and **React**. Designed to monitor examination sessions through camera streams, screen shares, periodic background snapshot capturing, clipboard security guardrails, and offline directory archiving.

---

## 🌟 Key Features

1. **Pre-Exam Readiness Checklist**:
   - **Custom Storage Destination**: Candidate or proctor can select a designated local folder to archive examination evidence.
   - **Live Webcam Preview**: Validates camera hardware permissions and identity before starting.
   - **Live Screen Sharing Feed**: Integrated window/screen picker via Electron desktopCapturer.
   - **Fullscreen Enforcement**: Locks into fullscreen with guardrails.

2. **Periodic Dual Snapshot Capturing**:
   - Simultaneously captures camera frames (via HTML5 canvas) and desktop screenshots (via Electron native `desktopCapturer`) every 5 seconds.
   - Automatically organizes images into `snapshots/camera/` and `snapshots/screen/` subfolders with timestamps.

3. **Security Guardrails**:
   - Prevents `Cmd + C` / `Ctrl + C` copy actions during the exam session.
   - Restricts external navigation and displays proctoring rule reminders.
   - Real-time elapsed examination timer synchronized across IPC.

4. **Production Packaging**:
   - Packaged with **Electron Forge** and `@electron-forge/maker-dmg` to produce macOS `.dmg` installer packages.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Run the Vite development server in one terminal:
```bash
npm run dev
```

In another terminal, launch the Electron app:
```bash
npm run electron
```

### 3. Build Production Bundle
```bash
npm run build
```

### 4. Create macOS DMG Package
```bash
npm run make
```
The output `.dmg` file will be generated in `out/make/`.

---

## 📂 Project Architecture
```
.
├── app/
│   ├── app.js            # Electron main process (IPC handlers, desktopCapturer, menu)
│   └── preload.js        # Secure contextBridge API for the renderer
├── src/
│   ├── App.jsx           # Main proctoring interface & checklist
│   ├── App.css           # Premium UI styling and design system
│   ├── main.jsx          # React DOM entry point
│   └── index.css         # Base resets and typography tokens
├── public/               # Static assets & SVG icons
├── forge.config.js       # Electron Forge packaging & DMG maker configuration
├── vite.config.js        # Vite bundler configuration
└── package.json          # Dependencies & build scripts
```

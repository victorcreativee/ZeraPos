const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

let mainWindow;
let backendProcess;

const isDev = !app.isPackaged;
const BACKEND_PORT = 5005;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getLogFilePath() {
  const logDir = path.join(app.getPath("userData"), "logs");
  ensureDir(logDir);
  return path.join(logDir, "desktop.log");
}

function log(message, error = null) {
  const line = `[${new Date().toISOString()}] ${message}${
    error ? ` ${error.stack || error.message || error}` : ""
  }\n`;

  try {
    fs.appendFileSync(getLogFilePath(), line);
  } catch (_) {}

  if (isDev) console.log(line.trim());
}

function getBackendPath() {
  return isDev
    ? path.join(__dirname, "..", "backend")
    : path.join(process.resourcesPath, "backend");
}

function getFrontendIndexPath() {
  return path.join(process.resourcesPath, "frontend", "dist", "index.html");
}

function startBackend() {
  process.env.ZERAPOS_DATA_DIR = app.getPath("userData");
  process.env.NODE_ENV = isDev ? "development" : "production";
  process.env.PORT = String(BACKEND_PORT);

  const backendPath = getBackendPath();
  const backendServerPath = path.join(backendPath, "src", "server.js");

  log(`App packaged: ${app.isPackaged}`);
  log(`App userData: ${app.getPath("userData")}`);
  log(`Backend path: ${backendPath}`);

  if (isDev) {
    backendProcess = spawn("npm", ["run", "dev"], {
      cwd: backendPath,
      shell: true,
      stdio: "inherit",
    });
    return;
  }

  if (!fs.existsSync(backendServerPath)) {
    log(`Backend server file missing: ${backendServerPath}`);
    return;
  }

  backendProcess = spawn(process.execPath, [backendServerPath], {
    cwd: backendPath,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(BACKEND_PORT),
      ZERAPOS_DATA_DIR: app.getPath("userData"),
    },
  });

  backendProcess.stdout.on("data", (data) => {
    log(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    log(`[backend-error] ${data.toString().trim()}`);
  });

  backendProcess.on("error", (error) => {
    log("Failed to start backend:", error);
  });

  backendProcess.on("exit", (code, signal) => {
    log(`Backend exited. code=${code} signal=${signal}`);
  });
}

function waitForBackend(timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function check() {
      const req = http.get(
        `http://127.0.0.1:${BACKEND_PORT}/api/health`,
        (res) => {
          res.resume();

          if (res.statusCode >= 200 && res.statusCode < 300) {
            log("Backend health check passed");
            resolve();
          } else {
            retry();
          }
        }
      );

      req.on("error", retry);

      req.setTimeout(1000, () => {
        req.destroy();
        retry();
      });
    }

    function retry() {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error("Backend health check timed out"));
        return;
      }

      setTimeout(check, 500);
    }

    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const frontendIndexPath = getFrontendIndexPath();

    log(`Frontend index path: ${frontendIndexPath}`);

    if (!fs.existsSync(frontendIndexPath)) {
      log(`Frontend index missing: ${frontendIndexPath}`);
    }

    mainWindow.loadFile(frontendIndexPath);
  }
}

app.whenReady().then(() => {
  startBackend();

  waitForBackend()
    .catch((error) => {
      log("Backend did not become ready before UI opened:", error);
    })
    .finally(() => {
      createWindow();
    });
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

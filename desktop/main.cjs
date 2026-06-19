const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

const isDev = !app.isPackaged;

function startBackend() {
  process.env.ZERAPOS_DATA_DIR = app.getPath("userData");
  process.env.NODE_ENV = isDev ? "development" : "production";
  process.env.PORT = "5005";

  if (isDev) {
    backendProcess = spawn("npm", ["run", "dev"], {
      cwd: path.join(__dirname, "..", "backend"),
      shell: true,
      stdio: "inherit",
    });
    return;
  }

  const backendPath = path.join(process.resourcesPath, "backend");
  const backendServerPath = path.join(backendPath, "src", "server.js");

  backendProcess = spawn(process.execPath, [backendServerPath], {
    cwd: backendPath,
    shell: false,
    stdio: "ignore",
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: "5005",
      ZERAPOS_DATA_DIR: app.getPath("userData"),
    },
  });

  backendProcess.on("error", (error) => {
    console.log("Failed to start backend:", error.message);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    title: "Zera POS",
    backgroundColor: "#f1f5f9",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    const key = input.key.toLowerCase();

    if (
      input.key === "F5" ||
      (input.control && key === "r") ||
      (input.meta && key === "r")
    ) {
      event.preventDefault();
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(
      path.join(process.resourcesPath, "frontend", "dist", "index.html")
    );
  }
}

app.whenReady().then(() => {
  startBackend();

  setTimeout(() => {
    createWindow();
  }, 3000);
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();

  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) backendProcess.kill();
});

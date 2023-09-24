const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { fileNames } = require("./getFilenames");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../client/preload.js"),
      sandbox: false,
    },
  });

  try {
    if (process.platform === "darwin") {
      const iconPath = path.join(__dirname, "../public/icon.png");

      // Check if the file exists before setting it as an icon
      if (fs.existsSync(iconPath)) {
        app.dock.setIcon(iconPath);
      } else {
        console.error(`Icon file does not exist at path: ${iconPath}`);
      }
    }
  } catch (error) {
    console.error("Failed to set the dock icon:", error);
  }

  win.loadFile("index.html");

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("svg-filenames", fileNames("svg"));
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform === "darwin") app.quit();
});

const { app, BrowserWindow } = require("electron");
const path = require("node:path");
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

  win.loadFile("index.html");

  win.webContents.on("did-finish-load", () => {
    console.log("hi");
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

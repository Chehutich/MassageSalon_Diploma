import { app, BrowserWindow, ipcMain } from "electron";
import bcrypt from "bcryptjs";
import pg from "pg";
import started from "electron-squirrel-startup";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

ipcMain.handle("db:login", async (event, { email, password }) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) {
      return { success: false, error: "Користувача не знайдено" };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash || "",
    );

    if (!isPasswordValid) {
      return { success: false, error: "Невірний пароль" };
    }

    if (user.role !== "Admin") {
      return { success: false, error: "Відмовлено у доступі: ви не адмін" };
    }

    return {
      success: true,
      user: { id: user.id, name: `${user.first_name} ${user.last_name}` },
    };
  } catch (err: any) {
    console.error("Prisma Error:", err);
    return { success: false, error: "Помилка бази даних" };
  }
});

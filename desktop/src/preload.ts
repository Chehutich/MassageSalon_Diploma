import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("dbAPI", {
  login: (email: string, password: string) =>
    ipcRenderer.invoke("db:login", { email, password }),
});

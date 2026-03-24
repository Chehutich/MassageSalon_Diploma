import { contextBridge, ipcRenderer } from "electron";
import { CreateAppointmentPayload } from "./api/types";

contextBridge.exposeInMainWorld("dbAPI", {
  login: (email: string, password: string) =>
    ipcRenderer.invoke("db:login", { email, password }),
  getAppointments: () => ipcRenderer.invoke("db:get-appointments"),
  updateStatus: (data: { id: string; status: string }) =>
    ipcRenderer.invoke("db:update-appointment-status", data),
  getServices: () => ipcRenderer.invoke("db:get-services"),
  createGuestAppointment: (payload: CreateAppointmentPayload) =>
    ipcRenderer.invoke("db:create-appointment", payload),
  getAvailableSlots: (payload: {
    masterId: string;
    serviceId: string;
    date: string;
  }) => ipcRenderer.invoke("db:get-available-slots", payload),
  getMasters: () => ipcRenderer.invoke("db:get-masters"),
  searchClients: (query: string) =>
    ipcRenderer.invoke("db:search-clients", query),
});

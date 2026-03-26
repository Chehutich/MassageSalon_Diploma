import { contextBridge, ipcRenderer } from "electron";
import {
  AnalyticsParams,
  CreateAppointmentPayload,
  CreateMasterPayload,
  DbAPI,
  UpdateArgs,
  UpdateMasterPayload,
  UpdateStatusArgs,
} from "./api/types";

const api: DbAPI = {
  login: (email, pass) => ipcRenderer.invoke("db:login", { email, pass }),

  getAppointments: () => ipcRenderer.invoke("db:get-appointments"),

  updateStatus: (args: UpdateStatusArgs) =>
    ipcRenderer.invoke("db:update-appointment-status", args),

  createGuestAppointment: (payload: CreateAppointmentPayload) =>
    ipcRenderer.invoke("db:create-appointment", payload),

  getAvailableSlots: (payload) =>
    ipcRenderer.invoke("db:get-available-slots", payload),

  getServices: () => ipcRenderer.invoke("db:get-services"),

  createService: (data) => ipcRenderer.invoke("db:create-service", data),

  updateService: (args) => ipcRenderer.invoke("db:update-service", args),

  getMasters: () => ipcRenderer.invoke("db:get-masters"),

  createMaster: (data: CreateMasterPayload) =>
    ipcRenderer.invoke("db:create-master", data),

  updateMaster: (args: UpdateArgs<UpdateMasterPayload>) =>
    ipcRenderer.invoke("db:update-master", args),

  searchClients: (query) => ipcRenderer.invoke("db:search-clients", query),

  getCategories: () => ipcRenderer.invoke("db:get-categories"),

  createCategory: (data) => ipcRenderer.invoke("db:create-category", data),

  updateCategory: (args) => ipcRenderer.invoke("db:update-category", args),

  getClients: () => ipcRenderer.invoke("db:get-clients"),

  getClientById: (id) => ipcRenderer.invoke("db:get-client-by-id", id),

  getSchedule: (masterId) => ipcRenderer.invoke("db:get-schedule", masterId),

  upsertSchedule: (args) => ipcRenderer.invoke("db:upsert-schedule", args),

  addTimeOff: (args) => ipcRenderer.invoke("db:add-time-off", args),

  deleteTimeOff: (id) => ipcRenderer.invoke("db:delete-time-off", id),

  getAnalytics: (params: AnalyticsParams) =>
    ipcRenderer.invoke("db:get-analytics", params),
};

contextBridge.exposeInMainWorld("dbAPI", api);

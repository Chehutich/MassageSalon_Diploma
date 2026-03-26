import { contextBridge, ipcRenderer } from "electron";
import {
  CreateAppointmentPayload,
  Service,
  Master,
  UpdateStatusArgs,
  CreateMasterPayload,
  AvailableSlot,
  User,
  ServiceResponse,
  UpdateMasterPayload,
} from "./api/types";

contextBridge.exposeInMainWorld("dbAPI", {
  // Auth
  login: (email: string, pass: string): Promise<ServiceResponse<User>> =>
    ipcRenderer.invoke("db:login", { email, pass }),

  // Appointments
  getAppointments: (): Promise<ServiceResponse<AvailableSlot[]>> =>
    ipcRenderer.invoke("db:get-appointments"),

  updateStatus: (args: UpdateStatusArgs): Promise<ServiceResponse<void>> =>
    ipcRenderer.invoke("db:update-appointment-status", args),

  createGuestAppointment: (
    payload: CreateAppointmentPayload,
  ): Promise<ServiceResponse<AvailableSlot>> =>
    ipcRenderer.invoke("db:create-appointment", payload),

  getAvailableSlots: (payload: {
    masterId: string;
    serviceId: string;
    date: string;
  }): Promise<ServiceResponse<AvailableSlot[]>> =>
    ipcRenderer.invoke("db:get-available-slots", payload),

  // Services
  getServices: (): Promise<ServiceResponse<Service[]>> =>
    ipcRenderer.invoke("db:get-services"),

  createService: (
    data: Omit<Service, "id"> & { masterIds?: string[] },
  ): Promise<ServiceResponse<Service>> =>
    ipcRenderer.invoke("db:create-service", data),

  updateService: (args: {
    id: string;
    data: Partial<Service> & { masterIds?: string[] };
  }): Promise<ServiceResponse<void>> =>
    ipcRenderer.invoke("db:update-service", args),

  // Masters
  getMasters: (): Promise<ServiceResponse<Master[]>> =>
    ipcRenderer.invoke("db:get-masters"),
  createMaster: (data: CreateMasterPayload): Promise<ServiceResponse<Master>> =>
    ipcRenderer.invoke("db:create-master", data),

  updateMaster: (args: {
    id: string;
    data: UpdateMasterPayload;
  }): Promise<ServiceResponse<void>> =>
    ipcRenderer.invoke("db:update-master", args),

  // Clients / Users
  searchClients: (query: string): Promise<ServiceResponse<User[]>> =>
    ipcRenderer.invoke("db:search-clients", query),
});

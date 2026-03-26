import { contextBridge, ipcRenderer } from "electron";
import {
  Appointment,
  AvailableSlot,
  Category,
  Client,
  CreateAppointmentPayload,
  CreateMasterPayload,
  Master,
  Service,
  ServiceResponse,
  UpdateMasterPayload,
  UpdateStatusArgs,
  User,
} from "./api/types";

contextBridge.exposeInMainWorld("dbAPI", {
  // Auth
  login: (email: string, pass: string): Promise<ServiceResponse<User>> =>
    ipcRenderer.invoke("db:login", { email, pass }),

  // Appointments
  getAppointments: (): Promise<ServiceResponse<Appointment[]>> =>
    ipcRenderer.invoke("db:get-appointments"),

  updateStatus: (args: UpdateStatusArgs): Promise<ServiceResponse<void>> =>
    ipcRenderer.invoke("db:update-appointment-status", args),

  createGuestAppointment: (
    payload: CreateAppointmentPayload,
  ): Promise<ServiceResponse<Appointment>> =>
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

  // Categories
  getCategories: (): Promise<ServiceResponse<Category[]>> =>
    ipcRenderer.invoke("db:get-categories"),

  createCategory: (data: {
    title: string;
    slug: string;
    is_active: boolean;
  }): Promise<ServiceResponse<Category>> =>
    ipcRenderer.invoke("db:create-category", data),

  updateCategory: (args: {
    id: string;
    data: Partial<Omit<Category, "id">>;
  }): Promise<ServiceResponse<void>> =>
    ipcRenderer.invoke("db:update-category", args),

  // Clients
  getClients: (): Promise<ServiceResponse<Client[]>> =>
    ipcRenderer.invoke("db:get-clients"),

  getClientById: (id: string): Promise<ServiceResponse<ClientDetails>> =>
    ipcRenderer.invoke("db:get-client-by-id", id),
});

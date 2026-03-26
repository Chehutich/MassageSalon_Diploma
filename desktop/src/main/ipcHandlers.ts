import { ipcMain } from "electron";
import { AppointmentService } from "./services/appointment.service";
import { AuthService } from "./services/auth.service";
import { MasterService } from "./services/master.service";
import { ServicesService } from "./services/services.service";
import { CreateAppointmentPayload } from "../api/types";
import { CategoryService } from "./services/categories.service";
import { ClientService } from "./services/сlient.service";

export const registerIpcHandlers = () => {
  // Auth
  ipcMain.handle("db:login", async (_, { email, pass }) =>
    AuthService.login(email, pass),
  );

  // Appointments
  ipcMain.handle("db:get-appointments", async () =>
    AppointmentService.getAll(),
  );

  ipcMain.handle("db:update-appointment-status", async (_, args) =>
    AppointmentService.updateStatus(args.id, args.status),
  );

  ipcMain.handle("db:get-available-slots", async (_, args) =>
    AppointmentService.getAvailableSlots(
      args.masterId,
      args.serviceId,
      args.date,
    ),
  );

  ipcMain.handle(
    "db:create-appointment",
    async (_, payload: CreateAppointmentPayload) => {
      return await AppointmentService.createAppointment(payload);
    },
  );

  // Masters & Services
  ipcMain.handle("db:get-masters", async () => {
    return await MasterService.getAll();
  });

  ipcMain.handle("db:create-master", async (_, payload) => {
    return await MasterService.createMaster(payload);
  });

  ipcMain.handle("db:update-master", async (_, { id, data }) => {
    return await MasterService.updateMaster(id, data);
  });

  ipcMain.handle("db:get-services", async () => {
    return await ServicesService.getAll();
  });

  ipcMain.handle("db:update-service", async (_, { id, data }) => {
    return await ServicesService.updateService(id, data);
  });

  ipcMain.handle("db:create-service", async (_, data) => {
    return await ServicesService.createService(data);
  });

  ipcMain.handle("db:search-clients", async (_, query) =>
    MasterService.searchClients(query),
  );

  // Categories
  ipcMain.handle("db:get-categories", async () => {
    return await CategoryService.getAll();
  });

  ipcMain.handle("db:create-category", async (_, data) => {
    return await CategoryService.createCategory(data);
  });

  ipcMain.handle("db:update-category", async (_, { id, data }) => {
    return await CategoryService.updateCategory(id, data);
  });

  // Clients
  ipcMain.handle("db:get-clients", async () => {
    return await ClientService.getAll();
  });

  ipcMain.handle("db:get-client-by-id", (_, id: string) =>
    ClientService.getById(id),
  );
};

import { ipcMain } from "electron";
import { AppointmentService } from "./services/appointment.service";
import { AuthService } from "./services/auth.service";
import { MasterService } from "./services/master.service";
import { ServicesService } from "./services/services.service";
import { CreateAppointmentPayload } from "../api/types";

export const registerIpcHandlers = () => {
  // Auth
  ipcMain.handle("db:login", async (_, { email, password }) =>
    AuthService.login(email, password),
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
  ipcMain.handle("db:get-masters", async () => MasterService.getAll());

  ipcMain.handle("db:get-services", async () => {
    return await ServicesService.getAll();
  });

  ipcMain.handle("db:search-clients", async (_, query) =>
    MasterService.searchClients(query),
  );
};

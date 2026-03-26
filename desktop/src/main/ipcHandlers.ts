import { ipcMain } from "electron";
import { AppointmentService } from "./services/appointment.service";
import { AuthService } from "./services/auth.service";
import { MasterService } from "./services/master.service";
import { ServicesService } from "./services/services.service";
import { CategoryService } from "./services/categories.service";
import { ClientService } from "./services/сlient.service";
import { ScheduleService } from "./services/schedule.service";
import { getAnalytics } from "./services/analytics.service";

export const registerIpcHandlers = () => {
  // Auth
  ipcMain.handle("db:login", (_, { email, pass }) =>
    AuthService.login(email, pass),
  );

  // Appointments
  ipcMain.handle("db:get-appointments", () => AppointmentService.getAll());
  ipcMain.handle("db:update-appointment-status", (_, args) =>
    AppointmentService.updateStatus(args.id, args.status),
  );
  ipcMain.handle("db:get-available-slots", (_, args) =>
    AppointmentService.getAvailableSlots(
      args.masterId,
      args.serviceId,
      args.date,
    ),
  );
  ipcMain.handle("db:create-appointment", (_, payload) =>
    AppointmentService.createAppointment(payload),
  );

  // Masters
  ipcMain.handle("db:get-masters", () => MasterService.getAll());
  ipcMain.handle("db:create-master", (_, payload) =>
    MasterService.createMaster(payload),
  );
  ipcMain.handle("db:update-master", (_, { id, data }) =>
    MasterService.updateMaster(id, data),
  );
  ipcMain.handle("db:search-clients", (_, query) =>
    MasterService.searchClients(query),
  );

  // Services
  ipcMain.handle("db:get-services", () => ServicesService.getAll());
  ipcMain.handle("db:create-service", (_, data) =>
    ServicesService.createService(data),
  );
  ipcMain.handle("db:update-service", (_, { id, data }) =>
    ServicesService.updateService(id, data),
  );

  // Categories
  ipcMain.handle("db:get-categories", () => CategoryService.getAll());
  ipcMain.handle("db:create-category", (_, data) =>
    CategoryService.createCategory(data),
  );
  ipcMain.handle("db:update-category", (_, { id, data }) =>
    CategoryService.updateCategory(id, data),
  );

  // Clients
  ipcMain.handle("db:get-clients", () => ClientService.getAll());
  ipcMain.handle("db:get-client-by-id", (_, id: string) =>
    ClientService.getById(id),
  );

  // Schedule
  ipcMain.handle("db:get-schedule", (_, masterId) =>
    ScheduleService.getByMaster(masterId),
  );
  ipcMain.handle(
    "db:upsert-schedule",
    (_, { masterId, dayOfWeek, startTime, endTime }) =>
      ScheduleService.upsertSchedule(masterId, dayOfWeek, startTime, endTime),
  );
  ipcMain.handle(
    "db:add-time-off",
    (_, { masterId, startDate, endDate, reason }) =>
      ScheduleService.addTimeOff(masterId, startDate, endDate, reason),
  );
  ipcMain.handle("db:delete-time-off", (_, id) =>
    ScheduleService.deleteTimeOff(id),
  );

  // Analytics
  ipcMain.handle("db:get-analytics", getAnalytics);
};

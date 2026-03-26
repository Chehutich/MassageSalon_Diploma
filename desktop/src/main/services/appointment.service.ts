import { prisma } from "../db/prisma";
import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentPayload,
  ServiceResponse,
  AvailableSlot,
  AvailableSlotsResponse,
} from "../../api/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const AppointmentService = {
  async getAll(): Promise<ServiceResponse<Appointment[]>> {
    try {
      const data = await prisma.appointments.findMany({
        include: {
          users: true,
          services: true,
          masters: {
            include: { users: true },
          },
        },
        orderBy: { start_time: "desc" },
      });

      return { success: true, data: JSON.parse(JSON.stringify(data)) };
    } catch (err: unknown) {
      console.error("Prisma Fetch Error:", err);
      return { success: false, error: (err as Error).message };
    }
  },

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<ServiceResponse<void>> {
    try {
      await prisma.appointments.update({ where: { id }, data: { status } });
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async getAvailableSlots(
    masterId: string,
    serviceId: string,
    date: string,
  ): Promise<ServiceResponse<AvailableSlotsResponse>> {
    try {
      const targetDateUtc = dayjs(date).utc(true).startOf("day");
      const dayOfWeek = targetDateUtc.day();

      const [service, schedule, appointments, timeOffs] = await Promise.all([
        prisma.services.findUnique({ where: { id: serviceId } }),
        prisma.schedules.findFirst({
          where: { master_id: masterId, day_of_week: dayOfWeek },
        }),
        prisma.appointments.findMany({
          where: {
            master_id: masterId,
            status: { not: "Cancelled" },
            start_time: {
              gte: targetDateUtc.toDate(),
              lt: targetDateUtc.add(1, "day").toDate(),
            },
          },
        }),
        prisma.time_offs.findMany({
          where: {
            master_id: masterId,
            start_date: { lte: targetDateUtc.toDate() },
            end_date: { gte: targetDateUtc.toDate() },
          },
        }),
      ]);

      if (timeOffs.length > 0) {
        return { success: true, data: { slots: [], reason: "time_off" } };
      }

      if (!schedule) {
        return { success: true, data: { slots: [], reason: "day_off" } };
      }

      if (!service) {
        return { success: false, error: "Послугу не знайдено" };
      }

      const slots: AvailableSlot[] = [];
      const duration = service.duration;

      const sDate = new Date(schedule.start_time);
      const eDate = new Date(schedule.end_time);

      let currentStart = targetDateUtc
        .set("hour", sDate.getUTCHours())
        .set("minute", sDate.getUTCMinutes())
        .set("second", 0);

      const dayLimit = targetDateUtc
        .set("hour", eDate.getUTCHours())
        .set("minute", eDate.getUTCMinutes())
        .set("second", 0);

      const minAllowed = dayjs().utc().add(1, "hour");

      while (
        currentStart.add(duration, "minute").isBefore(dayLimit) ||
        currentStart.add(duration, "minute").isSame(dayLimit)
      ) {
        const currentEnd = currentStart.add(duration, "minute");

        const isOverlapping = appointments.some((app) => {
          const appStart = dayjs(app.start_time).utc();
          const appEnd = dayjs(app.end_time).utc();
          return currentStart.isBefore(appEnd) && currentEnd.isAfter(appStart);
        });

        if (!isOverlapping && currentStart.isAfter(minAllowed)) {
          slots.push({
            start: currentStart.toISOString(),
            end: currentEnd.toISOString(),
            label: currentStart.local().format("HH:mm"),
          });
        }

        currentStart = currentStart.add(30, "minute");
      }

      return { success: true, data: { slots, reason: null } };
    } catch (err: unknown) {
      console.error("Critical Slots Error:", err);
      return { success: false, error: (err as Error).message };
    }
  },

  async createAppointment(
    payload: CreateAppointmentPayload,
  ): Promise<ServiceResponse<Appointment>> {
    const {
      firstName,
      lastName,
      phone,
      existingClientId,
      masterId,
      serviceId,
      startTime,
      actualPrice,
      clientNotes,
    } = payload;

    try {
      const service = await prisma.services.findUnique({
        where: { id: serviceId },
      });
      const duration = service?.duration ?? 60;

      const start = dayjs(startTime).utc();
      const end = start.add(duration, "minute");

      const result = await prisma.$transaction(async (tx) => {
        const clientId =
          existingClientId ??
          (
            await tx.users.create({
              data: {
                first_name: firstName,
                last_name: lastName,
                phone,
                role: "Guest",
              },
            })
          ).id;

        return tx.appointments.create({
          data: {
            client_id: clientId,
            master_id: masterId,
            service_id: serviceId,
            start_time: start.toDate(),
            end_time: end.toDate(),
            actual_price: actualPrice.toString(),
            status: "Confirmed",
            client_notes: clientNotes ?? null,
          },
        });
      });

      return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (err: unknown) {
      const errorMsg = (err as Error).message ?? String(err);
      console.error("Create Appointment Error:", errorMsg);

      if (errorMsg.includes("no_overlapping_appointments")) {
        return { success: false, error: "Цей час вже зайнятий у майстра" };
      }

      return {
        success: false,
        error: "Не вдалося створити запис: " + errorMsg,
      };
    }
  },
};

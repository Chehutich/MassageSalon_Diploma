import { prisma } from "../db/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const toLocalTimeString = (date: Date): string =>
  dayjs.utc(date).local().format("HH:mm");

const toUTCTimeDate = (localTimeStr: string): Date => {
  return dayjs(`1970-01-01T${localTimeStr}:00`).utc().toDate();
};

export const ScheduleService = {
  async getByMaster(masterId: string) {
    const [schedules, timeOffs] = await Promise.all([
      prisma.schedules.findMany({
        where: { master_id: masterId },
        orderBy: { day_of_week: "asc" },
      }),
      prisma.time_offs.findMany({
        where: { master_id: masterId },
        orderBy: { start_date: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        schedules: schedules.map((s) => ({
          ...s,
          start_time: toLocalTimeString(s.start_time),
          end_time: toLocalTimeString(s.end_time),
        })),
        timeOffs: timeOffs.map((t) => ({
          ...t,
          start_date: dayjs.utc(t.start_date).format("YYYY-MM-DD"),
          end_date: dayjs.utc(t.end_date).format("YYYY-MM-DD"),
        })),
      },
    };
  },

  async upsertSchedule(
    masterId: string,
    dayOfWeek: number,
    startTime: string | null,
    endTime: string | null,
  ) {
    await prisma.schedules.deleteMany({
      where: { master_id: masterId, day_of_week: dayOfWeek },
    });

    if (startTime && endTime) {
      await prisma.schedules.create({
        data: {
          master_id: masterId,
          day_of_week: dayOfWeek,
          start_time: toUTCTimeDate(startTime),
          end_time: toUTCTimeDate(endTime),
        },
      });
    }

    return { success: true };
  },

  async addTimeOff(
    masterId: string,
    startDate: string,
    endDate: string,
    reason?: string,
  ) {
    const data = await prisma.time_offs.create({
      data: {
        master_id: masterId,
        start_date: new Date(`${startDate}T00:00:00.000Z`),
        end_date: new Date(`${endDate}T00:00:00.000Z`),
        reason: reason ?? null,
      },
    });

    return {
      success: true,
      data: {
        ...data,
        start_date: dayjs.utc(data.start_date).format("YYYY-MM-DD"),
        end_date: dayjs.utc(data.end_date).format("YYYY-MM-DD"),
      },
    };
  },

  async deleteTimeOff(id: string) {
    await prisma.time_offs.delete({ where: { id } });
    return { success: true };
  },
};

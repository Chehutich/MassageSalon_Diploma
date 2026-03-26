import dayjs from "dayjs";
import { AnalyticsAppointment } from "../../../api/types";

export const toRows = (data: AnalyticsAppointment[]) =>
  data.map((a) => ({
    id: a.id,
    date: dayjs(a.start_time).format("YYYY-MM-DD"),
    month: dayjs(a.start_time).format("MMM YYYY"),
    status: a.status,
    price: Number(a.actual_price),
    master: `${a.masters.users.first_name} ${a.masters.users.last_name}`,
    masterId: a.masters.id,
    service: a.services.title,
    category: a.services.categories.title,
    duration: a.services.duration,
  }));

export type AnalyticsRow = ReturnType<typeof toRows>[0];

export const revenueByMonth = (rows: AnalyticsRow[]) => {
  const map: Record<string, number> = {};
  rows
    .filter((r) => r.status === "Completed")
    .forEach((r) => {
      map[r.month] = (map[r.month] ?? 0) + r.price;
    });
  return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
};

export const appointmentsByMonth = (rows: AnalyticsRow[]) => {
  const map: Record<string, Record<string, number>> = {};
  rows.forEach((r) => {
    map[r.month] ??= {};
    map[r.month][r.status] = (map[r.month][r.status] ?? 0) + 1;
  });
  return Object.entries(map).map(([month, counts]) => ({ month, ...counts }));
};

export const statusDistribution = (rows: AnalyticsRow[]) => {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    map[r.status] = (map[r.status] ?? 0) + 1;
  });
  return Object.entries(map).map(([status, count]) => ({ status, count }));
};

export const revenueByMaster = (rows: AnalyticsRow[]) => {
  const map: Record<string, number> = {};
  rows
    .filter((r) => r.status === "Completed")
    .forEach((r) => {
      map[r.master] = (map[r.master] ?? 0) + r.price;
    });
  return Object.entries(map)
    .map(([master, revenue]) => ({ master, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
};

export const topServices = (rows: AnalyticsRow[]) => {
  const map: Record<string, { count: number; revenue: number }> = {};
  rows
    .filter((r) => r.status === "Completed")
    .forEach((r) => {
      map[r.service] ??= { count: 0, revenue: 0 };
      map[r.service].count++;
      map[r.service].revenue += r.price;
    });
  return Object.entries(map)
    .map(([service, v]) => ({ service, ...v }))
    .sort((a, b) => b.count - a.count);
};

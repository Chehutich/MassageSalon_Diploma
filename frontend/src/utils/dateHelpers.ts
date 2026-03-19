import {
  format,
  parseISO,
  isAfter,
  subHours,
  isToday as isTodayDateFns,
  isTomorrow as isTomorrowDateFns,
} from "date-fns";
import { uk } from "date-fns/locale";

export const formatAppointmentDate = (date: string | Date) => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "eeeeee, d MMM", { locale: uk });
};

export const formatAppointmentTimeRange = (
  start: string | Date,
  end: string | Date,
) => {
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;

  return `${format(s, "HH:mm")} – ${format(e, "HH:mm")}`;
};

export const checkCanCancel = (startTime: string | Date, limitHours = 1) => {
  const start = typeof startTime === "string" ? parseISO(startTime) : startTime;
  const limit = subHours(start, limitHours);
  return isAfter(limit, new Date());
};

export const isToday = (date: string | Date) => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isTodayDateFns(d);
};

export const isTomorrow = (date: string | Date) => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isTomorrowDateFns(d);
};

export const formatTime = (date: string | Date) => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm", { locale: uk });
};

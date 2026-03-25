import React from "react";
import { DatePicker } from "antd";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface AppointmentFiltersProps {
  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  view: string | number;
  onlyDates?: boolean;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  dateRange,
  setDateRange,
  view,
  onlyDates = false,
}) => {
  if (onlyDates) {
    return (
      <RangePicker
        style={{ width: 280 }}
        placeholder={["Початок", "Кінець"]}
        format="DD.MM.YYYY"
        disabled={view === "Today"}
        value={view === "Today" ? null : dateRange}
        onChange={(dates) =>
          setDateRange(dates as [Dayjs | null, Dayjs | null] | null)
        }
      />
    );
  }

  return null;
};

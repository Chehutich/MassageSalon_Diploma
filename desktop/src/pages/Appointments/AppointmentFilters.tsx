import React from "react";
import { Input, Select, DatePicker, Button } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { Service } from "../../api/types";

const { RangePicker } = DatePicker;

interface AppointmentFiltersProps {
  searchText: string;
  setSearchText: (val: string) => void;
  serviceFilter: string | null;
  setServiceFilter: (val: string | null) => void;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  setDateRange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  services: Service[];
  view: string | number;
  onReset: () => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({
  searchText,
  setSearchText,
  serviceFilter,
  setServiceFilter,
  dateRange,
  setDateRange,
  services,
  view,
  onReset,
}) => (
  <div
    style={{
      marginBottom: 16,
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
    }}
  >
    <Input
      placeholder="Пошук клієнта..."
      prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
      style={{ width: 220 }}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      allowClear
    />

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

    <Select
      placeholder="Усі послуги"
      suffixIcon={<FilterOutlined />}
      style={{ width: 200 }}
      allowClear
      value={serviceFilter}
      onChange={setServiceFilter}
      options={services.map((s) => ({ label: s.title, value: s.id }))}
      showSearch={{
        optionFilterProp: "label",
      }}
    />

    <Button onClick={onReset} type="default">
      Скинути
    </Button>
  </div>
);

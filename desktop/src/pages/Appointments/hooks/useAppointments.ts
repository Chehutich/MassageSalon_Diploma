import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Appointment, Service } from "../../../api/types";

export const useAppointments = () => {
  const [data, setData] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<string | number>("Today");
  const [searchText, setSearchText] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    const [appRes, servRes] = await Promise.all([
      window.dbAPI.getAppointments(),
      window.dbAPI.getServices(),
    ]);

    if (appRes.success) setData(appRes.data);
    if (servRes.success) setServices(servRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (view === "Today") {
      const today = dayjs().format("YYYY-MM-DD");
      result = result.filter(
        (item) => dayjs(item.start_time).format("YYYY-MM-DD") === today,
      );
    } else if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf("day").valueOf();
      const end = dateRange[1].endOf("day").valueOf();
      result = result.filter((item) => {
        const itemTime = dayjs(item.start_time).valueOf();
        return itemTime >= start && itemTime <= end;
      });
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.users?.first_name?.toLowerCase().includes(lowerSearch) ||
          item.users?.last_name?.toLowerCase().includes(lowerSearch) ||
          item.users?.phone?.includes(searchText),
      );
    }

    if (serviceFilter) {
      result = result.filter((item) => item.service_id === serviceFilter);
    }

    return result.sort((a, b) => {
      const timeA = dayjs(a.start_time).valueOf();
      const timeB = dayjs(b.start_time).valueOf();
      return view === "Today" ? timeA - timeB : timeB - timeA;
    });
  }, [data, view, searchText, serviceFilter, dateRange]);

  const totalRevenue = useMemo(
    () =>
      filteredData
        .filter((item) => item.status === "Completed")
        .reduce((sum, item) => sum + Number(item.actual_price || 0), 0),
    [filteredData],
  );

  return {
    data: filteredData,
    services,
    loading,
    view,
    setView,
    searchText,
    setSearchText,
    serviceFilter,
    setServiceFilter,
    dateRange,
    setDateRange,
    totalRevenue,
    refresh: loadInitialData,
  };
};

import { useEffect, useMemo, useState } from "react";
import { Client, ClientDetails, AppointmentStatus } from "../../../api/types";

export const useClientDrawer = (visible: boolean, client: Client | null) => {
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | null>(
    null,
  );

  useEffect(() => {
    if (!visible || !client) return;
    setLoading(true);
    setStatusFilter(null);
    setDetails(null);
    window.dbAPI.getClientById(client.id).then((res) => {
      if (res.success && res.data) setDetails(res.data);
      setLoading(false);
    });
  }, [visible, client]);

  const appointments = details?.appointments ?? [];

  const filteredAppointments = useMemo(
    () =>
      statusFilter
        ? appointments.filter((a) => a.status === statusFilter)
        : appointments,
    [appointments, statusFilter],
  );

  const totalSpent = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "Completed")
        .reduce((sum, a) => sum + Number(a.actual_price), 0),
    [appointments],
  );

  const visitCount = useMemo(
    () => appointments.filter((a) => a.status === "Completed").length,
    [appointments],
  );

  const favoriteService = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      if (a.status === "Completed")
        counts[a.services.title] = (counts[a.services.title] ?? 0) + 1;
    });
    return Object.entries(counts).sort((x, y) => y[1] - x[1])[0]?.[0] ?? "—";
  }, [appointments]);

  return {
    details,
    loading,
    appointments,
    filteredAppointments,
    totalSpent,
    visitCount,
    favoriteService,
    statusFilter,
    setStatusFilter,
  };
};

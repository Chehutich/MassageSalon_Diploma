import { useEffect, useState } from "react";
import { message } from "antd";
import { Dayjs } from "dayjs";
import { Master, Schedule, TimeOff } from "../../../api/types";

export const useSchedule = () => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.dbAPI.getMasters().then((res) => {
      if (res.success && res.data) setMasters(res.data);
    });
  }, []);

  const loadSchedule = async (masterId: string) => {
    setLoading(true);
    const res = await window.dbAPI.getSchedule(masterId);
    if (res.success && res.data) {
      setSchedules(res.data.schedules);
      setTimeOffs(res.data.timeOffs);
    }
    setLoading(false);
  };

  const handleMasterChange = (id: string) => {
    setSelectedMasterId(id);
    loadSchedule(id);
  };

  const getScheduleForDay = (day: number) =>
    schedules.find((s) => s.day_of_week === day);

  const handleToggleDay = async (day: number, enabled: boolean) => {
    if (!selectedMasterId) return;
    await window.dbAPI.upsertSchedule({
      masterId: selectedMasterId,
      dayOfWeek: day,
      startTime: enabled ? "09:00" : null,
      endTime: enabled ? "18:00" : null,
    });
    if (!enabled) {
      setSchedules((prev) => prev.filter((s) => s.day_of_week !== day));
    } else {
      await loadSchedule(selectedMasterId);
    }
  };

  const handleTimeChange = async (
    day: number,
    startTime: string,
    endTime: string,
  ) => {
    if (!selectedMasterId) return;
    await window.dbAPI.upsertSchedule({
      masterId: selectedMasterId,
      dayOfWeek: day,
      startTime,
      endTime,
    });
    setSchedules((prev) =>
      prev.map((s) =>
        s.day_of_week === day
          ? { ...s, start_time: startTime, end_time: endTime }
          : s,
      ),
    );
  };

  const handleAddTimeOff = async (range: [Dayjs, Dayjs], reason: string) => {
    if (!selectedMasterId) return false;
    const res = await window.dbAPI.addTimeOff({
      masterId: selectedMasterId,
      startDate: range[0].format("YYYY-MM-DD"),
      endDate: range[1].format("YYYY-MM-DD"),
      reason: reason || undefined,
    });
    if (res.success) {
      message.success("Відгул додано");
      loadSchedule(selectedMasterId);
      return true;
    }
    return false;
  };

  const handleDeleteTimeOff = async (id: string) => {
    await window.dbAPI.deleteTimeOff(id);
    message.success("Відгул видалено");
    if (selectedMasterId) loadSchedule(selectedMasterId);
  };

  return {
    masters,
    selectedMasterId,
    schedules,
    timeOffs,
    loading,
    handleMasterChange,
    getScheduleForDay,
    handleToggleDay,
    handleTimeChange,
    handleAddTimeOff,
    handleDeleteTimeOff,
  };
};

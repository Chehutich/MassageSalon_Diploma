import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toRows, AnalyticsRow } from "../utils/aggregations";

export const useAnalytics = (range: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = range
      ? {
          from: range[0].startOf("day").toISOString(),
          to: range[1].endOf("day").toISOString(),
        }
      : {};
    window.dbAPI.getAnalytics(params).then((res) => {
      console.log("getAnalytics res:", res);
      if (res.success) setRows(toRows(res.data ?? []));
      setLoading(false);
    });
  }, [range?.[0]?.valueOf(), range?.[1]?.valueOf()]);

  return { rows, loading };
};

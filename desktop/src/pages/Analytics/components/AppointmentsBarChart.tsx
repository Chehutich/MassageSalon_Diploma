import React from "react";
import { Card, Typography } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_LABELS: Record<string, string> = {
  Completed: "Виконано",
  Confirmed: "Очікується",
  Cancelled: "Скасовано",
  NoShow: "Не прийшов",
};

const COLORS: Record<string, string> = {
  Completed: "#0f766e",
  Confirmed: "#3b82f6",
  Cancelled: "#f59e0b",
  NoShow: "#ef4444",
};

interface Props {
  data: Record<string, string | number>[];
}

export const AppointmentsBarChart: React.FC<Props> = ({ data }) => {
  const statuses = ["Completed", "Confirmed", "Cancelled", "NoShow"];

  return (
    <Card
      title={<Typography.Text strong>Записи по місяцях</Typography.Text>}
      size="small"
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend formatter={(v) => STATUS_LABELS[v] ?? v} />
          {statuses.map((s) => (
            <Bar
              key={s}
              dataKey={s}
              stackId="a"
              fill={COLORS[s]}
              name={STATUS_LABELS[s]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

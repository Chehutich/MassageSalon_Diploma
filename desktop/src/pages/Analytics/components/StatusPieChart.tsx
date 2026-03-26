import React from "react";
import { Card, Typography } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { pluralizeUk } from "../../../../src/utils/pluralize";

const STATUS_LABELS: Record<string, string> = {
  Completed: "Виконано",
  Confirmed: "Очікується",
  Cancelled: "Скасовано",
  NoShow: "Не прийшов",
};

const COLORS = ["#0f766e", "#3b82f6", "#f59e0b", "#ef4444"];

interface Props {
  data: { status: string; count: number }[];
}

export const StatusPieChart: React.FC<Props> = ({ data }) => {
  const mapped = data.map((d) => ({
    ...d,
    name: STATUS_LABELS[d.status] ?? d.status,
  }));

  return (
    <Card
      title={<Typography.Text strong>Статуси записів</Typography.Text>}
      size="small"
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={mapped}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {mapped.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [
              `${v} ${pluralizeUk(v, ["запис", "записи", "записів"])}`,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

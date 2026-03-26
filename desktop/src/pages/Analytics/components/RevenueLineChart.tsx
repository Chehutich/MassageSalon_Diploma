import React from "react";
import { Card, Typography } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; revenue: number }[];
}

export const RevenueLineChart: React.FC<Props> = ({ data }) => (
  <Card
    title={<Typography.Text strong>Дохід по місяцях</Typography.Text>}
    size="small"
  >
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString("uk-UA")} ₴`, "Дохід"]}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#0f766e"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

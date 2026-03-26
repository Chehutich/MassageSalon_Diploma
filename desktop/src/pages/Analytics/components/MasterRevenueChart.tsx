import React from "react";
import { Card, Typography } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: { master: string; revenue: number }[];
}

export const MasterRevenueChart: React.FC<Props> = ({ data }) => (
  <Card
    title={<Typography.Text strong>Дохід по майстрах</Typography.Text>}
    size="small"
  >
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0f0f0"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v / 1000}k`}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="master"
          width={120}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString("uk-UA")} ₴`, "Дохід"]}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill="#0f766e" fillOpacity={1 - i * 0.15} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

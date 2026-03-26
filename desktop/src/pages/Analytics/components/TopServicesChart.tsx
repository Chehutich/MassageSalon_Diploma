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
} from "recharts";
import { pluralizeUk } from "../../../../src/utils/pluralize";

interface Props {
  data: { service: string; count: number; revenue: number }[];
}

export const TopServicesChart: React.FC<Props> = ({ data }) => (
  <Card
    title={<Typography.Text strong>Топ послуг за візитами</Typography.Text>}
    size="small"
  >
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0f0f0"
          horizontal={false}
        />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="service"
          width={140}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(v: number, name: string) =>
            name === "count"
              ? [`${v} ${pluralizeUk(v, ["візит", "візити", "візитів"])}`]
              : [`${v.toLocaleString("uk-UA")} ₴`, "Дохід"]
          }
        />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[0, 4, 4, 0]}
          name="count"
        />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

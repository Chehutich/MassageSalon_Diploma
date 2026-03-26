import React, { useMemo, useState } from "react";
import { Card, Col, DatePicker, Row, Space, Spin, Tag } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PageHeader } from "../../../src/components/shared/PageHeader";
import { useAnalytics } from "./hooks/useAnalytics";
import { ExportToolbar } from "./components/ExportToolbar";
import {
  revenueByMonth,
  appointmentsByMonth,
  statusDistribution,
  revenueByMaster,
  topServices,
} from "./utils/aggregations";
import { RevenueLineChart } from "./components/RevenueLineChart";
import { AppointmentsBarChart } from "./components/AppointmentsBarChart";
import { StatusPieChart } from "./components/StatusPieChart";
import { MasterRevenueChart } from "./components/MasterRevenueChart";
import { TopServicesChart } from "./components/TopServicesChart";

const { RangePicker } = DatePicker;

export const AnalyticsPage: React.FC = () => {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const { rows, loading } = useAnalytics(range);

  const revMonthly = useMemo(() => revenueByMonth(rows), [rows]);
  const apptMonthly = useMemo(() => appointmentsByMonth(rows), [rows]);
  const statusDist = useMemo(() => statusDistribution(rows), [rows]);
  const masterRev = useMemo(() => revenueByMaster(rows), [rows]);
  const topSvc = useMemo(() => topServices(rows), [rows]);

  const totalRevenue = useMemo(
    () =>
      rows
        .filter((r) => r.status === "Completed")
        .reduce((s, r) => s + r.price, 0),
    [rows],
  );

  return (
    <Card
      style={{ boxShadow: "none", border: "none" }}
      styles={{ body: { padding: "12px 24px" } }}
    >
      <PageHeader
        title="Аналітика"
        icon={<BarChartOutlined />}
        extra={
          <Space>
            <RangePicker
              presets={[
                {
                  label: "Цей місяць",
                  value: [dayjs().startOf("month"), dayjs()],
                },
                { label: "Цей рік", value: [dayjs().startOf("year"), dayjs()] },
                {
                  label: "30 днів",
                  value: [dayjs().subtract(30, "day"), dayjs()],
                },
              ]}
              onChange={(v) => setRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            />
            <ExportToolbar rows={rows} />
            <Tag color="green">
              Дохід: {totalRevenue.toLocaleString("uk-UA")} ₴
            </Tag>
            <Tag color="cyan">Записів: {rows.length}</Tag>
          </Space>
        }
      />

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <RevenueLineChart data={revMonthly} />
          </Col>
          <Col span={8}>
            <StatusPieChart data={statusDist} />
          </Col>
          <Col span={24}>
            <AppointmentsBarChart data={apptMonthly} />
          </Col>
          <Col span={12}>
            <MasterRevenueChart data={masterRev} />
          </Col>
          <Col span={12}>
            <TopServicesChart data={topSvc} />
          </Col>
        </Row>
      </Spin>
    </Card>
  );
};

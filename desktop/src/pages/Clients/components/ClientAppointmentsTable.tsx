import React from "react";
import { Select, Space, Table, Typography } from "antd";
import dayjs from "dayjs";
import {
  AppointmentStatus,
  ClientDetails,
  NavigateFn,
  TAB_KEYS,
} from "../../../api/types";
import { getStatusTag } from "../../Appointments/AppointmentColumns";
import { DRAWER_ACCENT } from "../../../../src/components/shared/drawerStyles";

const { Text, Title } = Typography;

type AppointmentRow = ClientDetails["appointments"][0];

const columns = (onNavigate?: NavigateFn, onClose?: () => void) => [
  {
    title: "Дата",
    dataIndex: "start_time",
    key: "date",
    render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"),
    sorter: (a: AppointmentRow, b: AppointmentRow) =>
      dayjs(a.start_time).unix() - dayjs(b.start_time).unix(),
    defaultSortOrder: "descend" as const,
  },
  {
    title: "Послуга",
    key: "service",
    render: (_: unknown, r: AppointmentRow) => <Text>{r.services.title}</Text>,
    sorter: (a: AppointmentRow, b: AppointmentRow) =>
      a.services.title.localeCompare(b.services.title),
  },
  {
    title: "Майстер",
    key: "master",
    render: (_: unknown, r: AppointmentRow) => (
      <Text>
        {r.masters.users.first_name} {r.masters.users.last_name}
      </Text>
    ),
  },
  {
    title: "Вартість",
    dataIndex: "actual_price",
    key: "price",
    render: (v: number) => (
      <Text strong style={{ color: DRAWER_ACCENT }}>
        {v} ₴
      </Text>
    ),
    sorter: (a: AppointmentRow, b: AppointmentRow) =>
      a.actual_price - b.actual_price,
  },
  {
    title: "Статус",
    dataIndex: "status",
    key: "status",
    render: (s: string) => getStatusTag(s as AppointmentStatus),
  },
];

interface Props {
  appointments: AppointmentRow[];
  filteredAppointments: AppointmentRow[];
  statusFilter: AppointmentStatus | null;
  onStatusFilterChange: (v: AppointmentStatus | null) => void;
  onNavigate?: NavigateFn;
  onClose?: () => void;
}

export const ClientAppointmentsTable: React.FC<Props> = ({
  appointments,
  filteredAppointments,
  statusFilter,
  onStatusFilterChange,
  onNavigate,
  onClose,
}) => (
  <>
    <Space
      style={{
        width: "100%",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <Title level={5} style={{ fontSize: 14, margin: 0 }}>
        Історія записів ({appointments.length})
      </Title>
      <Select
        placeholder="Всі статуси"
        allowClear
        style={{ width: 160 }}
        value={statusFilter}
        onChange={(v) => onStatusFilterChange(v ?? null)}
        options={[
          { label: "Очікується", value: "Confirmed" },
          { label: "Виконано", value: "Completed" },
          { label: "Не прийшов", value: "NoShow" },
          { label: "Скасовано", value: "Cancelled" },
        ]}
      />
    </Space>
    <Table
      dataSource={filteredAppointments}
      columns={columns(onNavigate, onClose)}
      rowKey="id"
      size="small"
      pagination={{ pageSize: 5, showSizeChanger: false }}
      locale={{ emptyText: "Записів не знайдено" }}
      onRow={
        onNavigate
          ? (r) => ({
              style: { cursor: "pointer" },
              onClick: () => {
                onClose?.();
                onNavigate(TAB_KEYS.appointments, {
                  id: r.id,
                  type: "appointment",
                });
              },
            })
          : undefined
      }
    />
  </>
);

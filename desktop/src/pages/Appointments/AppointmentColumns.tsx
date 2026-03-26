import React from "react";
import { Space, Typography, Tag, Dropdown, MenuProps, Button } from "antd";
import {
  ClockCircleOutlined,
  CheckOutlined,
  UserDeleteOutlined,
  CloseOutlined,
  DownOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Appointment, AppointmentStatus, Service } from "../../api/types";

const { Text, Link } = Typography;

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { color: string; text: string }
> = {
  Confirmed: { color: "blue", text: "Очікується" },
  Completed: { color: "green", text: "Виконано" },
  NoShow: { color: "volcano", text: "Не прийшов" },
  Cancelled: { color: "red", text: "Скасовано" },
};

export const getStatusTag = (status: AppointmentStatus | string) => {
  const config = STATUS_CONFIG[status as AppointmentStatus] ?? {
    color: "default",
    text: status,
  };
  return <Tag color={config.color}>{config.text}</Tag>;
};

export const getColumns = (
  updateStatus: (id: string, status: AppointmentStatus) => void,
  handleNavigate: (type: string, id: string, name: string) => void,
  onShowDetails: (record: Appointment) => void,
  services: Service[],
) => [
  {
    title: "Час та Дата",
    dataIndex: "start_time",
    key: "time",
    width: 150,
    sorter: (a: Appointment, b: Appointment) =>
      dayjs(a.start_time).unix() - dayjs(b.start_time).unix(),
    render: (time: string) => {
      const dateObj = dayjs(time);
      const isToday = dateObj.isSame(dayjs(), "day");
      return (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: "#0f766e", fontSize: "14px" }}>
            {dateObj.format("HH:mm")}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {isToday ? "Сьогодні" : dateObj.format("DD.MM.YYYY")}
          </Text>
        </Space>
      );
    },
  },
  {
    title: "Клієнт",
    key: "client",
    sorter: (a: Appointment, b: Appointment) =>
      a.users.first_name.localeCompare(b.users.first_name),
    render: (record: Appointment) => (
      <Link
        onClick={(e) => {
          e.stopPropagation();
          handleNavigate(
            "client",
            record.users.id,
            `${record.users.first_name} ${record.users.last_name}`,
          );
        }}
      >
        {record.users?.first_name} {record.users?.last_name}
      </Link>
    ),
  },
  {
    title: "Послуга",
    key: "service",
    sorter: (a: Appointment, b: Appointment) =>
      a.services.title.localeCompare(b.services.title),
    filters: services.map((s) => ({ text: s.title, value: s.id })),
    onFilter: (value: unknown, record: Appointment) =>
      record.services?.id === value,
    filterSearch: true,
    render: (record: Appointment) => (
      <Link
        onClick={(e) => {
          e.stopPropagation();
          handleNavigate(
            "service",
            record.services?.id,
            record.services?.title,
          );
        }}
      >
        <Text italic style={{ color: "inherit" }}>
          {record.services?.title}
        </Text>
      </Link>
    ),
  },
  {
    title: "Вартість",
    dataIndex: "actual_price",
    key: "price",
    sorter: (a: Appointment, b: Appointment) => a.actual_price - b.actual_price,
    render: (price: number) => <Text strong>{price} ₴</Text>,
  },
  {
    title: "Статус",
    key: "status",
    sorter: (a: Appointment, b: Appointment) =>
      a.status.localeCompare(b.status),
    filters: (Object.keys(STATUS_CONFIG) as AppointmentStatus[]).map((key) => ({
      text: STATUS_CONFIG[key].text,
      value: key,
    })),
    onFilter: (value: unknown, record: Appointment) => record.status === value,
    render: (record: Appointment) => {
      const items: MenuProps["items"] = [
        {
          key: "Confirmed",
          label: "Очікується",
          icon: <ClockCircleOutlined />,
        },
        { key: "Completed", label: "Виконано", icon: <CheckOutlined /> },
        {
          key: "NoShow",
          label: "Не прийшов",
          icon: <UserDeleteOutlined />,
          danger: true,
        },
        {
          key: "Cancelled",
          label: "Скасовано",
          icon: <CloseOutlined />,
          danger: true,
        },
      ];
      return (
        <Dropdown
          menu={{
            items,
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              updateStatus(record.id, key as AppointmentStatus);
            },
            selectedKeys: [record.status],
          }}
          trigger={["click"]}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: "pointer" }}
          >
            {getStatusTag(record.status)}
            <DownOutlined
              style={{ fontSize: "10px", marginLeft: "4px", color: "#bfbfbf" }}
            />
          </div>
        </Dropdown>
      );
    },
  },
  {
    title: "Дії",
    key: "actions",
    width: 120,
    render: (record: Appointment) => (
      <Button
        type="text"
        icon={<InfoCircleOutlined style={{ color: "#0f766e" }} />}
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails(record);
        }}
      >
        Деталі
      </Button>
    ),
  },
];

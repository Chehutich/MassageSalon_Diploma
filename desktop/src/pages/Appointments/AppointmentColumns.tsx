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
import { Appointment, AppointmentStatus } from "../../api/types";

const { Text, Link } = Typography;

export const getStatusTag = (status: AppointmentStatus | string) => {
  const config: Record<string, { color: string; text: string }> = {
    Confirmed: { color: "blue", text: "Очікується" },
    Completed: { color: "green", text: "Виконано" },
    NoShow: { color: "volcano", text: "Не прийшов" },
    Cancelled: { color: "red", text: "Скасовано" },
  };
  const { color, text } = config[status] || { color: "default", text: status };
  return <Tag color={color}>{text}</Tag>;
};

export const getColumns = (
  updateStatus: (id: string, status: AppointmentStatus) => void,
  handleNavigate: (type: string, id: string, name: string) => void,
  onShowDetails: (record: Appointment) => void,
) => [
  {
    title: "Час та Дата",
    dataIndex: "start_time",
    key: "time",
    width: 150,
    render: (time: string) => {
      const dateObj = dayjs(time);
      const isToday = dateObj.isSame(dayjs(), "day");

      return (
        <Space orientation="vertical" size={0}>
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
    render: (record: Appointment) => (
      <Link
        onClick={(e) => {
          e.stopPropagation();
          handleNavigate("клієнта", record.users.id, record.users.first_name);
        }}
      >
        {record.users?.first_name} {record.users?.last_name}
      </Link>
    ),
  },
  {
    title: "Послуга",
    key: "service",
    render: (record: Appointment) => (
      <Link
        onClick={(e) => {
          e.stopPropagation();
          handleNavigate(
            "послуги",
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
    title: "Статус",
    key: "status",
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
              style={{
                fontSize: "10px",
                marginLeft: "4px",
                color: "#bfbfbf",
              }}
            />
          </div>
        </Dropdown>
      );
    },
  },
  {
    title: "Дії",
    key: "actions",
    width: 100,
    render: (record: Appointment) => (
      <Button
        size="small"
        icon={<InfoCircleOutlined />}
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

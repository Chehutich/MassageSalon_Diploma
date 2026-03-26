import { Space, Typography, Button, Tag } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Master, Service } from "../../api/types";

const { Text } = Typography;

export const getMasterColumns = (
  onEdit: (record: Master) => void,
  services: Service[],
) => [
  {
    title: "Майстер",
    key: "master",
    sorter: (a: Master, b: Master) =>
      a.users.first_name.localeCompare(b.users.first_name),
    render: (_: unknown, record: Master) => (
      <Space>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#f0fafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #0f766e33",
          }}
        >
          <UserOutlined style={{ color: "#0f766e" }} />
        </div>
        <Space direction="vertical" size={0}>
          <Text
            strong
            style={{ color: record.is_active ? "inherit" : "#bfbfbf" }}
          >
            {record.users.first_name} {record.users.last_name}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.users.email || "Без email"}
          </Text>
        </Space>
      </Space>
    ),
  },
  {
    title: "Телефон",
    dataIndex: ["users", "phone"],
    key: "phone",
    render: (phone: string) => (
      <Space>
        <PhoneOutlined style={{ color: "#bfbfbf" }} />
        <Text>{phone || "—"}</Text>
      </Space>
    ),
  },
  {
    title: "Послуги",
    key: "services_count",
    filters: services.map((s) => ({ text: s.title, value: s.id })),
    filterSearch: true,
    onFilter: (value: unknown, record: Master) =>
      record.master_services?.some((ms) => ms.service_id === value) ?? false,
    render: (_: unknown, record: Master) => (
      <Tag color="blue" icon={<SolutionOutlined />}>
        {record.master_services?.length ?? 0} послуг
      </Tag>
    ),
  },
  {
    title: "Статус",
    dataIndex: "is_active",
    key: "status",
    filters: [
      { text: "Активний", value: true },
      { text: "Архів", value: false },
    ],
    onFilter: (value: unknown, record: Master) => record.is_active === value,
    render: (active: boolean) => (
      <Tag color={active ? "success" : "default"}>
        {active ? "Активний" : "Архів"}
      </Tag>
    ),
  },
  {
    title: "Дії",
    key: "actions",
    width: 120,
    render: (_: unknown, record: Master) => (
      <Button
        type="text"
        icon={<UserOutlined style={{ color: "#0f766e" }} />}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(record);
        }}
      >
        Профіль
      </Button>
    ),
  },
];

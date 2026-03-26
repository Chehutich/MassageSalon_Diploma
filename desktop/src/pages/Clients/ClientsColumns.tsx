import { TableColumnsType, Tag, Typography } from "antd";
import { Client, Role } from "../../api/types";
import dayjs from "dayjs";

const { Text } = Typography;

const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; order: number }
> = {
  [Role.Client]: { label: "Клієнт", color: "blue", order: 1 },
  [Role.Guest]: { label: "Гість", color: "default", order: 2 },
};

export const getClientColumns = (): TableColumnsType<Client> => [
  {
    title: "Ім'я",
    key: "name",
    render: (_, r) => (
      <Text strong>
        {r.first_name} {r.last_name}
      </Text>
    ),
    sorter: (a, b) => a.last_name.localeCompare(b.last_name),
  },
  {
    title: "Роль",
    dataIndex: "role",
    key: "role",
    width: 100,
    render: (role: string) => {
      const config = ROLE_CONFIG[role];
      return config ? (
        <Tag color={config.color}>{config.label}</Tag>
      ) : (
        <Tag>{role}</Tag>
      );
    },
    sorter: (a, b) =>
      (ROLE_CONFIG[a.role]?.order ?? 99) - (ROLE_CONFIG[b.role]?.order ?? 99),
    defaultSortOrder: "ascend",
    filters: [
      { text: "Клієнт", value: Role.Client },
      { text: "Гість", value: Role.Guest },
    ],
    onFilter: (value, record) => record.role === value,
  },
  {
    title: "Телефон",
    dataIndex: "phone",
    key: "phone",
    render: (v) => v ?? <Text type="secondary">—</Text>,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (v) => v ?? <Text type="secondary">—</Text>,
  },
  {
    title: "Записів",
    key: "appointments",
    align: "center",
    render: (_, r) => <Tag color="cyan">{r._count?.appointments ?? 0}</Tag>,
    sorter: (a, b) =>
      (a._count?.appointments ?? 0) - (b._count?.appointments ?? 0),
  },
  {
    title: "Останній візит",
    key: "last_appointment",
    render: (_, r) =>
      r.last_appointment ? (
        dayjs(r.last_appointment).format("DD.MM.YYYY")
      ) : (
        <Text type="secondary">—</Text>
      ),
    sorter: (a, b) =>
      dayjs(a.last_appointment ?? 0).unix() -
      dayjs(b.last_appointment ?? 0).unix(),
  },
  {
    title: "Реєстрація",
    dataIndex: "created_at",
    key: "created_at",
    render: (v) => dayjs(v).format("DD.MM.YYYY"),
    sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
  },
];

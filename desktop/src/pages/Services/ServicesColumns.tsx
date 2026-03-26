import { Space, Typography, Tag, Button } from "antd";
import { EditOutlined, FolderOutlined } from "@ant-design/icons";
import { Category, Service } from "../../api/types";

const { Text } = Typography;

export const getServiceColumns = (
  onEdit: (record: Service) => void,
  categories: Category[],
) => [
  {
    title: "Послуга",
    dataIndex: "title",
    key: "title",
    sorter: (a: Service, b: Service) => a.title.localeCompare(b.title),
    render: (text: string, record: Service) => (
      <Space orientation="vertical" size={0}>
        <Text
          strong
          style={{ color: record.is_active ? "inherit" : "#bfbfbf" }}
        >
          {text}
        </Text>
        <Text type="secondary" style={{ fontSize: "11px" }}>
          {record.slug}
        </Text>
      </Space>
    ),
  },
  {
    title: "Категорія",
    dataIndex: ["categories", "title"],
    key: "category",
    sorter: (a: Service, b: Service) =>
      (a.categories?.title ?? "").localeCompare(b.categories?.title ?? ""),
    filters: categories.map((c) => ({ text: c.title, value: c.id })),
    filterSearch: true,
    onFilter: (value: unknown, record: Service) => record.category_id === value,
    render: (category: string, record: Service) => (
      <Tag
        color={record.is_active ? "geekblue" : "default"}
        icon={<FolderOutlined />}
      >
        {category || "Без категорії"}
      </Tag>
    ),
  },
  {
    title: "Ціна",
    dataIndex: "price",
    key: "price",
    sorter: (a: Service, b: Service) => Number(a.price) - Number(b.price),
    render: (price: number, record: Service) => (
      <Text strong style={{ color: record.is_active ? "inherit" : "#bfbfbf" }}>
        {price} ₴
      </Text>
    ),
  },
  {
    title: "Статус",
    dataIndex: "is_active",
    key: "is_active",
    sorter: (a: Service, b: Service) =>
      a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1,
    filters: [
      { text: "Активна", value: true },
      { text: "Архів", value: false },
    ],
    onFilter: (value: unknown, record: Service) => record.is_active === value,
    render: (active: boolean) => (
      <Tag
        color={active ? "success" : "default"}
        style={{ opacity: active ? 1 : 0.6 }}
      >
        {active ? "Активна" : "Архів"}
      </Tag>
    ),
  },
  {
    title: "Дії",
    key: "actions",
    width: 120,
    render: (_: unknown, record: Service) => (
      <Button
        type="text"
        icon={
          <EditOutlined
            style={{ color: record.is_active ? "#0f766e" : "#bfbfbf" }}
          />
        }
        onClick={(e) => {
          e.stopPropagation();
          onEdit(record);
        }}
      >
        Налаштувати
      </Button>
    ),
  },
];

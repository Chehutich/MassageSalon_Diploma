import { Space, Typography, Tag, Button } from "antd";
import { ScissorOutlined, FolderOutlined } from "@ant-design/icons";
import { Service } from "../../api/types";

const { Text } = Typography;

export const getServiceColumns = (onEdit: (record: Service) => void) => [
  {
    title: "Послуга",
    dataIndex: "title",
    key: "title",
    sorter: (a: Service, b: Service) => a.title.localeCompare(b.title),
    render: (text: string, record: Service) => (
      <Space direction="vertical" size={0}>
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
    sorter: (a: Service, b: Service) => {
      const catA = a.categories?.title || "";
      const catB = b.categories?.title || "";
      return catA.localeCompare(catB);
    },
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
          <ScissorOutlined
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

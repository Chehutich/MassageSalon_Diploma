import React, { useEffect, useMemo, useState } from "react";
import { Badge, Card, Tag, Typography, Select, Space } from "antd";
import { FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Category, Service } from "../../api/types";

// Shared components
import { PageHeader } from "../../../src/components/shared/PageHeader";
import { DataTable } from "../../../src/components/shared/DataTable";
import { SearchToolbar } from "../../../src/components/shared/SearchToolbar";
import { EditCategoryModal } from "./EditCategoryModal";

const { Text } = Typography;

interface CategoriesPageProps {
  onNavigate?: (tabKey: string, params?: any) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onNavigate,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleOpenEdit = (record: Category | null) => {
    setEditingCategory(record);
    setIsModalVisible(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, servRes] = await Promise.all([
        window.dbAPI.getCategories(),
        window.dbAPI.getServices(),
      ]);
      if (catRes.success) setCategories(catRes.data || []);
      if (servRes.success) setServices(servRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const query = searchText.toLowerCase();
    return categories.filter((c) => {
      const matchText =
        c.title.toLowerCase().includes(query) ||
        c.slug.toLowerCase().includes(query);

      const matchService = serviceFilter
        ? services.some((s) => s.id === serviceFilter && s.category_id === c.id)
        : true;

      return matchText && matchService;
    });
  }, [categories, searchText, serviceFilter, services]);

  const columns = [
    {
      title: "Назва категорії",
      dataIndex: "title",
      key: "title",
      sorter: (a: Category, b: Category) => a.title.localeCompare(b.title),
      render: (text: string, record: Category) => (
        <Text
          strong
          style={{ color: record.is_active ? "inherit" : "#bfbfbf" }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      sorter: (a: Category, b: Category) => a.slug.localeCompare(b.slug),
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Послуг",
      key: "services_count",
      sorter: (a: any, b: any) =>
        (a._count?.services || 0) - (b._count?.services || 0),
      render: (_: any, record: any) => (
        <Badge count={record._count?.services || 0} showZero color="#0f766e" />
      ),
    },
    {
      title: "Статус",
      dataIndex: "is_active",
      key: "status",
      sorter: (a: Category, b: Category) =>
        Number(a.is_active) - Number(b.is_active),
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Активна" : "Архів"}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{ boxShadow: "none", border: "none" }}
        styles={{ body: { padding: "12px 24px" } }}
      >
        <PageHeader
          title="Категорії"
          icon={<FolderOutlined />}
          actionButton={{
            label: "Додати категорію",
            icon: <PlusOutlined />,
            onClick: () => handleOpenEdit(null),
          }}
          extra={<Tag color="cyan">Всього: {categories.length}</Tag>}
        />

        <SearchToolbar
          searchValue={searchText}
          onSearchChange={setSearchText}
          placeholder="Пошук категорії..."
          onClear={() => {
            setSearchText("");
            setServiceFilter(null);
          }}
          showClear={!!(searchText || serviceFilter)}
        >
          <Select
            placeholder="Знайти за послугою..."
            style={{ width: 250 }}
            allowClear
            showSearch
            optionFilterProp="label"
            value={serviceFilter}
            onChange={setServiceFilter}
            options={services.map((s) => ({ label: s.title, value: s.id }))}
          />
        </SearchToolbar>

        <DataTable
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRowClick={handleOpenEdit}
          rowClassName={(record) => (!record.is_active ? "archived-row" : "")}
        />

        <EditCategoryModal
          visible={isModalVisible}
          category={editingCategory}
          onClose={() => setIsModalVisible(false)}
          onSuccess={loadData}
          onNavigate={onNavigate}
        />
      </Card>
    </div>
  );
};

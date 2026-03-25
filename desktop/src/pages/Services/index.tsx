import React, { useEffect, useMemo, useState } from "react";
import { Card, Select, Tag } from "antd";
import { PlusOutlined, ScissorOutlined } from "@ant-design/icons";
import { Service } from "../../api/types";
import { SearchToolbar } from "../../../src/components/shared/SearchToolbar";
import { DataTable } from "../../../src/components/shared/DataTable";
import { PageHeader } from "../../../src/components/shared/PageHeader";
import { EditServiceModal } from "./EditServiceModal";
import { getServiceColumns } from "./ServicesColumns";

interface ServicesPageProps {
  initialId?: string | null;
  onHandled?: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  initialId,
  onHandled,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleOpenEdit = (record: Service | null) => {
    setEditingService(record);
    setIsModalVisible(true);
  };

  const loadServices = async () => {
    setLoading(true);
    const res = await window.dbAPI.getServices();
    if (res.success && res.data) {
      setServices(res.data);
      if (initialId) {
        const target = res.data.find((s) => s.id === initialId);
        if (target) setSearchText(target.title);
        onHandled?.();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const columns = useMemo(() => getServiceColumns(handleOpenEdit), []);

  const categoriesOptions = useMemo(() => {
    const map = new Map();
    services.forEach((s) => {
      if (s.categories) map.set(s.categories.id, s.categories.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({
      label: title,
      value: id,
    }));
  }, [services]);

  const filteredData = useMemo(() => {
    return services.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchText.toLowerCase()) ||
        item.id.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = selectedCategory
        ? item.category_id === selectedCategory
        : true;
      return matchSearch && matchCategory;
    });
  }, [services, searchText, selectedCategory]);

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{ boxShadow: "none", border: "none" }}
        styles={{ body: { padding: "12px 24px" } }}
      >
        <PageHeader
          title="Послуги"
          icon={<ScissorOutlined />}
          actionButton={{
            label: "Додати послугу",
            icon: <PlusOutlined />,
            onClick: () => handleOpenEdit(null),
          }}
          extra={<Tag color="processing">Всього: {services.length}</Tag>}
        />

        <SearchToolbar
          searchValue={searchText}
          onSearchChange={setSearchText}
          placeholder="Пошук послуги..."
          onClear={() => {
            setSearchText("");
            setSelectedCategory(null);
          }}
          showClear={!!(searchText || selectedCategory)}
        >
          <Select
            placeholder="Всі категорії"
            style={{ width: 200 }}
            options={categoriesOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            allowClear
          />
        </SearchToolbar>

        <DataTable
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRowClick={(record) => handleOpenEdit(record)}
          rowClassName={(record) => (!record.is_active ? "archived-row" : "")}
        />

        <EditServiceModal
          visible={isModalVisible}
          service={editingService}
          onClose={() => {
            setIsModalVisible(false);
            setEditingService(null);
          }}
          onSuccess={loadServices}
        />
      </Card>
    </div>
  );
};

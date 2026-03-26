import React, { useEffect, useMemo, useState } from "react";
import { Card, Tag } from "antd";
import { PlusOutlined, ScissorOutlined } from "@ant-design/icons";
import { Category, Service } from "../../api/types";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleOpenEdit = (record: Service | null) => {
    setEditingService(record);
    setIsModalVisible(true);
  };

  const loadServices = async () => {
    setLoading(true);
    const [sRes, cRes] = await Promise.all([
      window.dbAPI.getServices(),
      window.dbAPI.getCategories(),
    ]);

    if (sRes.success && sRes.data) {
      setServices(sRes.data);
      if (initialId) {
        const target = sRes.data.find((s) => s.id === initialId);
        if (target) setSearchText(target.id);
        onHandled?.();
      }
    }

    if (cRes.success && cRes.data) setCategories(cRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, [initialId]);

  const columns = useMemo(
    () => getServiceColumns(handleOpenEdit, categories),
    [categories],
  );

  const filteredData = useMemo(() => {
    const query = searchText.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.slug.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query),
    );
  }, [services, searchText]);

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
          }}
          showClear={!!searchText}
        />

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

import React, { useEffect, useMemo, useState } from "react";
import { Card, Tag, Select } from "antd";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { Master, Service } from "../../api/types";

// Shared components
import { PageHeader } from "../../../src/components/shared/PageHeader";
import { DataTable } from "../../../src/components/shared/DataTable";
import { SearchToolbar } from "../../../src/components/shared/SearchToolbar";
import { getMasterColumns } from "./MastersColumns";
import { EditMasterModal } from "./EditMasterModal";

interface MastersPageProps {
  initialId?: string | null;
  onHandled?: () => void;
}

export const MastersPage: React.FC<MastersPageProps> = ({
  initialId,
  onHandled,
}) => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [mRes, sRes] = await Promise.all([
      window.dbAPI.getMasters(),
      window.dbAPI.getServices(),
    ]);

    if (mRes.success && mRes.data) {
      setMasters(mRes.data);
      if (initialId) {
        const target = mRes.data.find((m) => m.id === initialId);
        if (target) {
          setSearchText(target.id);
        }
        onHandled?.();
      }
    }

    if (sRes.success && sRes.data) {
      setServices(sRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [initialId]);

  const handleReset = () => {
    setSearchText("");
  };

  const handleOpenEdit = (record: Master | null) => {
    setEditingMaster(record);
    setIsModalVisible(true);
  };

  const columns = useMemo(
    () => getMasterColumns(handleOpenEdit, services),
    [services],
  );

  const filteredData = useMemo(() => {
    const query = searchText.toLowerCase().trim();
    return masters.filter((m) => {
      const firstName = m.users.first_name.toLowerCase();
      const lastName = m.users.last_name.toLowerCase();
      return (
        `${firstName} ${lastName}`.includes(query) ||
        `${lastName} ${firstName}`.includes(query) ||
        m.users.phone?.includes(query) ||
        m.users.email?.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query)
      );
    });
  }, [masters, searchText]);

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{ boxShadow: "none", border: "none" }}
        styles={{ body: { padding: "12px 24px" } }}
      >
        <PageHeader
          title="Майстри"
          icon={<UserOutlined />}
          actionButton={{
            label: "Додати майстра",
            icon: <PlusOutlined />,
            onClick: () => handleOpenEdit(null),
          }}
          extra={<Tag color="cyan">Всього: {masters.length}</Tag>}
        />

        <SearchToolbar
          searchValue={searchText}
          onSearchChange={setSearchText}
          placeholder="Пошук майстра..."
          onClear={handleReset}
          showClear={!!searchText}
        ></SearchToolbar>

        <DataTable
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRowClick={handleOpenEdit}
          rowClassName={(record) => (!record.is_active ? "archived-row" : "")}
        />

        <EditMasterModal
          visible={isModalVisible}
          master={editingMaster}
          onClose={() => {
            setIsModalVisible(false);
            setEditingMaster(null);
          }}
          onSuccess={loadData}
        />
      </Card>
    </div>
  );
};

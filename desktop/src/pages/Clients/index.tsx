import React, { useEffect, useMemo, useState } from "react";
import { Card, Tag } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { Client, NavigateFn } from "../../api/types";
import { PageHeader } from "../../../src/components/shared/PageHeader";
import { DataTable } from "../../../src/components/shared/DataTable";
import { SearchToolbar } from "../../../src/components/shared/SearchToolbar";
import { getClientColumns } from "./ClientsColumns";
import { ClientDrawer } from "./ClientDrawer";

interface ClientsPageProps {
  initialId?: string | null;
  onHandled?: () => void;
  onNavigate?: NavigateFn;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  initialId,
  onHandled,
  onNavigate,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await window.dbAPI.getClients();
    if (res.success && res.data) {
      setClients(res.data);
      if (initialId) {
        const target = res.data.find((c) => c.id === initialId);
        if (target) {
          setSearchText(target.id);
        }
        onHandled?.();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [initialId]);

  const columns = useMemo(() => getClientColumns(), []);

  const filteredData = useMemo(() => {
    const query = searchText.toLowerCase().trim();
    return clients.filter((c) => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      const reversed = `${c.last_name} ${c.first_name}`.toLowerCase();
      return (
        fullName.includes(query) ||
        reversed.includes(query) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      );
    });
  }, [clients, searchText]);

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{ boxShadow: "none", border: "none" }}
        styles={{ body: { padding: "12px 24px" } }}
      >
        <PageHeader
          title="Клієнти"
          icon={<TeamOutlined />}
          extra={<Tag color="cyan">Всього: {clients.length}</Tag>}
        />

        <SearchToolbar
          searchValue={searchText}
          onSearchChange={setSearchText}
          placeholder="Пошук клієнта..."
          onClear={() => setSearchText("")}
          showClear={!!searchText}
        />

        <DataTable
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRowClick={(record) => {
            setSelectedClient(record);
            setDrawerVisible(true);
          }}
        />
        <ClientDrawer
          client={selectedClient}
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          onNavigate={onNavigate}
        />
      </Card>
    </div>
  );
};

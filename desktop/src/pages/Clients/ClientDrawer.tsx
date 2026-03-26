import React from "react";
import { Drawer, Divider, Space, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Client, NavigateFn } from "../../api/types";
import { DRAWER_ACCENT } from "../../../src/components/shared/drawerStyles";
import { useClientDrawer } from "./hooks/useClientDrawer";
import { ClientContactInfo } from "./components/ClientContactInfo";
import { ClientStats } from "./components/ClientStats";
import { ClientAppointmentsTable } from "./components/ClientAppointmentsTable";

const { Text } = Typography;

interface Props {
  client: Client | null;
  visible: boolean;
  onClose: () => void;
  onNavigate?: NavigateFn;
}

export const ClientDrawer: React.FC<Props> = ({
  client,
  visible,
  onClose,
  onNavigate,
}) => {
  const {
    details,
    loading,
    appointments,
    filteredAppointments,
    totalSpent,
    visitCount,
    favoriteService,
    statusFilter,
    setStatusFilter,
  } = useClientDrawer(visible, client);

  return (
    <Drawer
      title={
        <Space>
          <UserOutlined style={{ color: DRAWER_ACCENT }} />
          <span>
            {client?.first_name} {client?.last_name}
          </span>
        </Space>
      }
      placement="right"
      size={680}
      onClose={onClose}
      open={visible}
      destroyOnHidden
      loading={loading}
    >
      {details && (
        <>
          <ClientContactInfo details={details} />
          <Divider />
          <ClientStats
            visitCount={visitCount}
            totalSpent={totalSpent}
            favoriteService={favoriteService}
          />
          <Divider />
          <ClientAppointmentsTable
            appointments={appointments}
            filteredAppointments={filteredAppointments}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onNavigate={onNavigate}
            onClose={onClose}
          />
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Text type="secondary" style={{ fontSize: 10 }}>
              ID: {details.id}
            </Text>
          </div>
        </>
      )}
    </Drawer>
  );
};

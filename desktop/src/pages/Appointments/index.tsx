import {
  DollarCircleOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Card, message, Segmented, Tag, Space, Select } from "antd";
import React, { useMemo, useState } from "react";
import {
  Appointment,
  AppointmentStatus,
  NavigateFn,
  TAB_KEYS,
} from "../../api/types";
import { getColumns, getStatusTag } from "./AppointmentColumns";
import { AppointmentDrawer } from "./AppointmentDrawer";
import { AppointmentFilters } from "./AppointmentFilters";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { useAppointments } from "./hooks/useAppointments";
import { PageHeader } from "../../../src/components/shared/PageHeader";
import { DataTable } from "../../../src/components/shared/DataTable";
import { SearchToolbar } from "../../../src/components/shared/SearchToolbar";

interface AppointmentsPageProps {
  onNavigate: NavigateFn;
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onNavigate }) => {
  const {
    data,
    services,
    loading,
    view,
    setView,
    totalRevenue,
    refresh,
    searchText,
    setSearchText,
    serviceFilter,
    setServiceFilter,
    dateRange,
    setDateRange,
  } = useAppointments();

  const [selectedRecord, setSelectedRecord] = useState<Appointment | null>(
    null,
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleReset = () => {
    setSearchText("");
    setServiceFilter(null);
    setDateRange(null);
  };

  const columns = useMemo(
    () =>
      getColumns(
        async (id: string, status: AppointmentStatus) => {
          const res = await window.dbAPI.updateStatus({ id, status });
          if (res.success) {
            message.success("Статус оновлено");
            refresh();
          }
        },
        (type: string, id: string) => {
          if (type === "service") {
            onNavigate("3", { id, type: "service" });
          } else if (type === "master") {
            onNavigate("2", { id, type: "master" });
          }
        },
        (record: Appointment) => {
          setSelectedRecord(record);
          setDrawerVisible(true);
        },
      ),
    [refresh, onNavigate],
  );

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{ boxShadow: "none", border: "none" }}
        styles={{ body: { padding: "12px 24px" } }}
      >
        <PageHeader
          title="Записи"
          icon={<CalendarOutlined />}
          actionButton={{
            label: "Новий запис",
            icon: <PlusOutlined />,
            onClick: () => setIsModalVisible(true),
          }}
          extra={
            <Space size="middle">
              <Segmented
                options={[
                  { label: "Сьогодні", value: "Today" },
                  { label: "Всі", value: "All" },
                ]}
                value={view}
                onChange={setView}
              />
              <Tag
                color="success"
                icon={<DollarCircleOutlined />}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Виручка: <b>{totalRevenue} грн</b>
              </Tag>
            </Space>
          }
        />

        <SearchToolbar
          searchValue={searchText}
          onSearchChange={setSearchText}
          placeholder="Пошук клієнта..."
          onClear={handleReset}
          showClear={
            !!(searchText || serviceFilter || dateRange || view !== "Today")
          }
        >
          <AppointmentFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            view={view}
            onlyDates={true}
          />

          <Select
            placeholder="Усі послуги"
            style={{ width: 200 }}
            allowClear
            value={serviceFilter}
            onChange={setServiceFilter}
            options={services.map((s) => ({ label: s.title, value: s.id }))}
          />
        </SearchToolbar>

        <DataTable
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRowClick={(record) => {
            setSelectedRecord(record);
            setDrawerVisible(true);
          }}
          pagination={{
            defaultPageSize: 5,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} з ${total} записів`,
          }}
        />

        <AppointmentDrawer
          record={selectedRecord}
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          getStatusTag={getStatusTag}
          handleNavigate={(type, id) => {
            setDrawerVisible(false);
            if (type === "service")
              onNavigate(TAB_KEYS.services, { id, type: "service" });
            if (type === "master")
              onNavigate(TAB_KEYS.masters, { id, type: "master" });
          }}
        />

        <CreateAppointmentModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSuccess={() => {
            message.success("Запис успішно створено");
            refresh();
          }}
        />
      </Card>
    </div>
  );
};

export default AppointmentsPage;

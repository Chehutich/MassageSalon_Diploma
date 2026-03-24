import { DollarCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useMemo, useState } from "react";
import { Appointment, AppointmentStatus } from "../../api/types";
import { getColumns, getStatusTag } from "./AppointmentColumns";
import { AppointmentDrawer } from "./AppointmentDrawer";
import { AppointmentFilters } from "./AppointmentFilters";
import { CreateAppointmentModal } from "./CreateAppointmentModal";
import { useAppointments } from "./hooks/useAppointments";

const { Title } = Typography;

const AppointmentsPage: React.FC = () => {
  const {
    data,
    services,
    loading,
    view,
    setView,
    totalRevenue,
    refresh,
    ...filterProps
  } = useAppointments();

  const [selectedRecord, setSelectedRecord] = useState<Appointment | null>(
    null,
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        (type: string, id: string, name: string) =>
          message.info(`Перехід до ${type}: ${name} (ID: ${id})`),

        (record: Appointment) => {
          setSelectedRecord(record);
          setDrawerVisible(true);
        },
      ),
    [refresh],
  );

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{ boxShadow: "none", border: "none" }}
        styles={{ body: { padding: "12px 24px" } }}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <Space size="middle">
              <Title level={4} style={{ margin: 0 }}>
                Записи
              </Title>
              <Segmented
                options={[
                  { label: "Сьогодні", value: "Today" },
                  { label: "Всі", value: "All" },
                ]}
                value={view}
                onChange={setView}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                style={{ backgroundColor: "#0f766e" }}
              >
                Новий запис
              </Button>
            </Space>
            <Tag
              color="success"
              icon={<DollarCircleOutlined />}
              style={{ padding: "4px 12px", borderRadius: 6, fontSize: "14px" }}
            >
              Виручка: <b>{totalRevenue} грн</b>
            </Tag>
          </div>
        }
      >
        <AppointmentFilters
          {...filterProps}
          services={services}
          view={view}
          onReset={() => {
            filterProps.setSearchText("");
            filterProps.setServiceFilter(null);
            filterProps.setDateRange(null);
            setView("All");
          }}
        />

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 5,
            pageSizeOptions: ["5", "10", "20", "50"],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} з ${total} записів`,
          }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedRecord(record);
              setDrawerVisible(true);
            },
            style: { cursor: "pointer" },
          })}
        />

        <AppointmentDrawer
          record={selectedRecord}
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          getStatusTag={getStatusTag}
          handleNavigate={(_type: string, _id: string, _name: string) =>
            message.info(`Навігація...`)
          }
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

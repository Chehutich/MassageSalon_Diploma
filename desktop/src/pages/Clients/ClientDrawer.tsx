import React, { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  Descriptions,
  Divider,
  Typography,
  Tag,
  Space,
  Table,
  Statistic,
  Row,
  Col,
  Select,
  Card,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  TrophyOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  AppointmentStatus,
  Client,
  ClientDetails,
  NavigateFn,
  TAB_KEYS,
} from "../../api/types";
import { getStatusTag } from "../Appointments/AppointmentColumns";
import {
  DRAWER_ACCENT,
  DRAWER_LABEL_STYLE,
} from "../../../src/components/shared/drawerStyles";

const { Text, Title } = Typography;

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
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | null>(
    null,
  );

  useEffect(() => {
    if (!visible || !client) return;
    setLoading(true);
    setStatusFilter(null);
    setDetails(null);
    window.dbAPI.getClientById(client.id).then((res) => {
      if (res.success && res.data) setDetails(res.data);
      setLoading(false);
    });
  }, [visible, client]);

  const appointments = details?.appointments ?? [];

  const filteredAppointments = useMemo(
    () =>
      statusFilter
        ? appointments.filter((a) => a.status === statusFilter)
        : appointments,
    [appointments, statusFilter],
  );

  const totalSpent = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "Completed")
        .reduce((sum, a) => sum + Number(a.actual_price), 0),
    [appointments],
  );

  const visitCount = useMemo(
    () => appointments.filter((a) => a.status === "Completed").length,
    [appointments],
  );

  const favoriteService = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      if (a.status === "Completed")
        counts[a.services.title] = (counts[a.services.title] ?? 0) + 1;
    });
    return Object.entries(counts).sort((x, y) => y[1] - x[1])[0]?.[0] ?? "—";
  }, [appointments]);

  type AppointmentRow = ClientDetails["appointments"][0];

  const appointmentColumns = [
    {
      title: "Дата",
      dataIndex: "start_time",
      key: "date",
      render: (v: string) => dayjs(v).format("DD.MM.YYYY HH:mm"),
      sorter: (a: AppointmentRow, b: AppointmentRow) =>
        dayjs(a.start_time).unix() - dayjs(b.start_time).unix(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "Послуга",
      key: "service",
      render: (_: unknown, r: AppointmentRow) =>
        onNavigate ? (
          <Text>{r.services.title}</Text>
        ) : (
          <Text>{r.services.title}</Text>
        ),
      sorter: (a: AppointmentRow, b: AppointmentRow) =>
        a.services.title.localeCompare(b.services.title),
    },
    {
      title: "Майстер",
      key: "master",
      render: (_: unknown, r: AppointmentRow) =>
        onNavigate ? (
          <Text>
            {r.masters.users.first_name} {r.masters.users.last_name}
          </Text>
        ) : (
          <Text>
            {r.masters.users.first_name} {r.masters.users.last_name}
          </Text>
        ),
    },
    {
      title: "Сума",
      dataIndex: "actual_price",
      key: "price",
      render: (v: number) => (
        <Text strong style={{ color: DRAWER_ACCENT }}>
          {v} ₴
        </Text>
      ),
      sorter: (a: AppointmentRow, b: AppointmentRow) =>
        a.actual_price - b.actual_price,
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (s: string) => getStatusTag(s as AppointmentStatus),
    },
  ];

  const statCardStyle: React.CSSProperties = {
    borderRadius: 8,
    textAlign: "center",
    height: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

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
      width={680}
      onClose={onClose}
      open={visible}
      destroyOnHidden
      loading={loading}
    >
      {details && (
        <>
          <Descriptions
            title={
              <Space>
                <UserOutlined />
                <span>Контактна інформація</span>
              </Space>
            }
            bordered
            column={1}
            size="small"
            labelStyle={DRAWER_LABEL_STYLE}
          >
            <Descriptions.Item label="ПІБ">
              <Text strong>
                {details.first_name} {details.last_name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Телефон">
              <Space>
                <PhoneOutlined style={{ color: "#bfbfbf" }} />
                <Text copyable={!!details.phone}>{details.phone ?? "—"}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined style={{ color: "#bfbfbf" }} />
                <Text copyable={!!details.email}>{details.email ?? "—"}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Реєстрація">
              <Space>
                <CalendarOutlined style={{ color: "#bfbfbf" }} />
                {dayjs(details.created_at).format("DD.MM.YYYY")}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Роль">
              <Tag color={details.role === "Client" ? "blue" : "default"}>
                {details.role === "Client" ? "Клієнт" : "Гість"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>
            Статистика
          </Title>
          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Card size="small" style={statCardStyle}>
                <Statistic
                  title="Завершених візитів"
                  value={visitCount}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: DRAWER_ACCENT }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={statCardStyle}>
                <Statistic
                  title="Витрачено"
                  value={totalSpent}
                  suffix="₴"
                  prefix={<DollarCircleOutlined />}
                  valueStyle={{ color: DRAWER_ACCENT }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={statCardStyle}>
                <Statistic
                  title="Улюблена послуга"
                  value={favoriteService}
                  prefix={<ScissorOutlined />}
                  valueStyle={{ fontSize: 13, color: DRAWER_ACCENT }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Title level={5} style={{ fontSize: 14, margin: 0 }}>
              Історія записів ({appointments.length})
            </Title>
            <Select
              placeholder="Всі статуси"
              allowClear
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v ?? null)}
              options={[
                { label: "Очікується", value: "Confirmed" },
                { label: "Виконано", value: "Completed" },
                { label: "Не прийшов", value: "NoShow" },
                { label: "Скасовано", value: "Cancelled" },
              ]}
            />
          </Space>

          <Table
            dataSource={filteredAppointments}
            columns={appointmentColumns}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 5, showSizeChanger: false }}
            locale={{ emptyText: "Записів не знайдено" }}
            onRow={
              onNavigate
                ? (r) => ({
                    style: { cursor: "pointer" },
                    onClick: () => {
                      onClose();
                      onNavigate(TAB_KEYS.appointments, {
                        id: r.id,
                        type: "appointment",
                      });
                    },
                  })
                : undefined
            }
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

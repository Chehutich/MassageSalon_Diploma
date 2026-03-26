import React from "react";
import {
  Drawer,
  Descriptions,
  Divider,
  Typography,
  Card,
  Tag,
  Space,
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  ScissorOutlined,
  WalletOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Appointment, NavigateFn, TAB_KEYS } from "../../api/types";
import {
  DRAWER_ACCENT,
  DRAWER_LABEL_STYLE,
} from "../../../src/components/shared/drawerStyles";

const { Text, Link, Title } = Typography;

interface Props {
  record: Appointment | null;
  visible: boolean;
  onClose: () => void;
  getStatusTag: (status: string) => React.ReactNode;
  onNavigate: NavigateFn;
}

export const AppointmentDrawer: React.FC<Props> = ({
  record,
  visible,
  onClose,
  getStatusTag,
  onNavigate,
}) => (
  <Drawer
    title={
      <Space>
        <InfoCircleOutlined style={{ color: DRAWER_ACCENT }} />
        <span>Деталі запису</span>
      </Space>
    }
    placement="right"
    size={520}
    onClose={onClose}
    open={visible}
    destroyOnHidden
  >
    {record && (
      <>
        <Descriptions
          title={
            <Space>
              <UserOutlined />
              <span>Інформація про клієнта</span>
            </Space>
          }
          bordered
          column={1}
          size="small"
          labelStyle={DRAWER_LABEL_STYLE}
        >
          <Descriptions.Item label="ПІБ">
            <Link
              strong
              onClick={() => {
                onClose();
                onNavigate(TAB_KEYS.clients, {
                  id: record.users?.id ?? "",
                  type: "client",
                });
              }}
            >
              {record.users?.first_name} {record.users?.last_name}
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Телефон">
            <Space>
              <PhoneOutlined style={{ color: "#bfbfbf" }} />
              <Text copyable={!!record.users?.phone}>
                {record.users?.phone ?? "—"}
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined style={{ color: "#bfbfbf" }} />
              <Text copyable={!!record.users?.email}>
                {record.users?.email ?? "—"}
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <Space>
              <ScissorOutlined />
              <span>Деталі послуги</span>
            </Space>
          }
          bordered
          column={1}
          size="small"
          labelStyle={DRAWER_LABEL_STYLE}
        >
          <Descriptions.Item label="Послуга">
            <Link
              onClick={() => {
                onClose();
                onNavigate(TAB_KEYS.services, {
                  id: record.services?.id ?? "",
                  type: "service",
                });
              }}
            >
              {record.services?.title}
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Майстер">
            <Link
              onClick={() => {
                onClose();
                onNavigate(TAB_KEYS.masters, {
                  id: record.masters?.id ?? "",
                  type: "master",
                });
              }}
            >
              {record.masters?.users?.first_name}{" "}
              {record.masters?.users?.last_name}
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Тривалість">
            <Space>
              <ClockCircleOutlined style={{ color: "#bfbfbf" }} />
              {record.services?.duration} хв
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <Space>
              <WalletOutlined />
              <span>Час та Вартість</span>
            </Space>
          }
          bordered
          column={1}
          size="small"
          labelStyle={DRAWER_LABEL_STYLE}
        >
          <Descriptions.Item label="Дата">
            {dayjs(record.start_time).format("DD.MM.YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Час">
            <Tag color="cyan" style={{ fontSize: 13 }}>
              {dayjs(record.start_time).format("HH:mm")} —{" "}
              {dayjs(record.end_time).format("HH:mm")}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Вартість">
            <Text strong style={{ color: DRAWER_ACCENT, fontSize: 16 }}>
              {record.actual_price} грн
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Статус">
            {getStatusTag(record.status)}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>
          Нотатки
        </Title>
        <Card
          size="small"
          style={{
            backgroundColor: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: 8,
          }}
        >
          <Text italic type={record.client_notes ? undefined : "secondary"}>
            {record.client_notes ?? "Додаткові нотатки відсутні..."}
          </Text>
        </Card>

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: 10 }}>
            ID запису: {record.id}
          </Text>
        </div>
      </>
    )}
  </Drawer>
);

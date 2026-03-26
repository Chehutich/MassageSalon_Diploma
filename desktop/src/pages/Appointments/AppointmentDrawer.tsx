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
import { Appointment } from "../../api/types";

const { Title, Text, Link } = Typography;

interface Props {
  record: Appointment | null;
  visible: boolean;
  onClose: () => void;
  getStatusTag: (status: string) => React.ReactNode;
  handleNavigate: (type: string, id: string, name: string) => void;
}

const commonLabelStyle: React.CSSProperties = {
  width: "160px",
  fontWeight: 600,
};

export const AppointmentDrawer: React.FC<Props> = ({
  record,
  visible,
  onClose,
  getStatusTag,
  handleNavigate,
}) => (
  <Drawer
    title={
      <Space>
        <InfoCircleOutlined style={{ color: "#0f766e" }} />
        <span>Деталі запису</span>
      </Space>
    }
    placement="right"
    size={500}
    onClose={onClose}
    open={visible}
    destroyOnHidden
  >
    {record && (
      <>
        {/* Client info */}
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
          labelStyle={commonLabelStyle}
        >
          <Descriptions.Item label="ПІБ">
            <Link
              strong
              onClick={() =>
                handleNavigate(
                  "client",
                  record.users?.id || "",
                  `${record.users?.first_name} ${record.users?.last_name}`,
                )
              }
            >
              {record.users?.first_name} {record.users?.last_name}
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Телефон">
            <Space>
              <PhoneOutlined style={{ color: "#bfbfbf" }} />
              <Text copyable={!!record.users?.phone}>
                {record.users?.phone || "—"}
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined style={{ color: "#bfbfbf" }} />
              {record.users?.email || "—"}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Service details */}
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
          labelStyle={commonLabelStyle}
        >
          <Descriptions.Item label="Назва послуги">
            <Link
              onClick={() =>
                handleNavigate(
                  "service",
                  record.services?.id || "",
                  record.services?.title || "",
                )
              }
            >
              {record.services?.title}
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Майстер">
            <Link
              onClick={() => {
                const fullName = `${record.masters?.users?.first_name} ${record.masters?.users?.last_name}`;

                handleNavigate(
                  "master",
                  record.masters?.id || "",
                  fullName, // Передаємо fullName замість тільки first_name
                );
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

        {/* Time and Price */}
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
          labelStyle={commonLabelStyle}
        >
          <Descriptions.Item label="Дата">
            {dayjs(record.start_time).format("DD.MM.YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Час">
            <Tag color="cyan" style={{ fontSize: "13px" }}>
              {dayjs(record.start_time).format("HH:mm")} —{" "}
              {dayjs(record.end_time).format("HH:mm")}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Вартість">
            <Text strong style={{ color: "#0f766e", fontSize: "16px" }}>
              {record.actual_price} грн
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Статус">
            {getStatusTag(record.status)}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Notes */}
        <Title level={5} style={{ fontSize: "14px", marginBottom: "8px" }}>
          Нотатки:
        </Title>
        <Card
          size="small"
          style={{
            backgroundColor: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: "8px",
          }}
        >
          <Text italic type={record.client_notes ? undefined : "secondary"}>
            {record.client_notes || "Додаткові нотатки відсутні..."}
          </Text>
        </Card>

        {/* Technical info */}
        <div style={{ marginTop: "24px", textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: "10px" }}>
            ID запису: {record.id}
          </Text>
        </div>
      </>
    )}
  </Drawer>
);

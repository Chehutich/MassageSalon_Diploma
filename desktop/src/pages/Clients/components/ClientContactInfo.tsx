import React from "react";
import { Descriptions, Space, Tag, Typography } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ClientDetails } from "../../../api/types";
import { DRAWER_LABEL_STYLE } from "../../../../src/components/shared/drawerStyles";

const { Text } = Typography;

interface Props {
  details: ClientDetails;
}

export const ClientContactInfo: React.FC<Props> = ({ details }) => (
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
);

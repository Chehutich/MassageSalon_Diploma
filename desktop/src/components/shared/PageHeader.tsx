import React from "react";
import { Typography, Space, Button } from "antd";

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
  actionButton?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  actionButton,
  extra,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    }}
  >
    <Space size="middle">
      <span style={{ fontSize: 24, color: "#0f766e", display: "flex" }}>
        {icon}
      </span>
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      {actionButton && (
        <Button
          type="primary"
          icon={actionButton.icon}
          onClick={actionButton.onClick}
          style={{ backgroundColor: "#0f766e" }}
        >
          {actionButton.label}
        </Button>
      )}
    </Space>
    {extra}
  </div>
);

import { Space } from "antd";

export const DRAWER_LABEL_STYLE: React.CSSProperties = {
  width: 160,
  fontWeight: 600,
};

export const DRAWER_ACCENT = "#0f766e";

export const DRAWER_SECTION_TITLE = (
  icon: React.ReactNode,
  text: string,
): React.ReactNode => (
  <Space>
    {icon}
    <span>{text}</span>
  </Space>
);

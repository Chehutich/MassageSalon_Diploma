import React from "react";
import { Form, Switch } from "antd";

interface Props {
  isActive: boolean;
  checkedText?: string;
  uncheckedText?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  size?: "small" | "default";
}

export const StatusSwitch: React.FC<Props> = ({
  isActive,
  checkedText = "Активна",
  uncheckedText = "Архів",
  activeLabel = "Активно",
  inactiveLabel = "В архіві",
  size = "default",
}) => (
  <div
    style={{
      marginBottom: 16,
      padding: "8px 12px",
      background: "#f5f5f5",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
    }}
  >
    <Form.Item name="is_active" valuePropName="checked" noStyle>
      <Switch
        size={size}
        checkedChildren={checkedText}
        unCheckedChildren={uncheckedText}
        style={{ backgroundColor: isActive ? "#0f766e" : "#ff4d4f" }}
      />
    </Form.Item>
    <span style={{ marginLeft: 12, fontWeight: 500 }}>
      {isActive ? activeLabel : inactiveLabel}
    </span>
  </div>
);

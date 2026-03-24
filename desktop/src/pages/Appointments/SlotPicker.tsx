import React from "react";
import { Radio, Space, Spin, Empty } from "antd";
import { AvailableSlot } from "../../api/types";

interface SlotPickerProps {
  value?: AvailableSlot;
  onChange?: (val: AvailableSlot) => void;
  slots: AvailableSlot[];
  loading: boolean;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  value,
  onChange,
  slots,
  loading,
}) => (
  <div
    style={{
      border: "1px solid #d9d9d9",
      padding: "12px",
      borderRadius: "8px",
      minHeight: "80px",
      maxHeight: "200px",
      overflowY: "auto",
    }}
  >
    {loading ? (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <Spin size="small" />
      </div>
    ) : slots.length > 0 ? (
      <Radio.Group
        buttonStyle="solid"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        <Space wrap>
          {slots.map((s) => (
            <Radio.Button key={s.start} value={s}>
              {s.label}
            </Radio.Button>
          ))}
        </Space>
      </Radio.Group>
    ) : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Немає вільного часу"
      />
    )}
  </div>
);

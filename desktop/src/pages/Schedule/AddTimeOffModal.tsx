import React, { useState } from "react";
import { Modal, Space, DatePicker, Input, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { ACCENT } from "./constants";

const { Text } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (range: [Dayjs, Dayjs], reason: string) => Promise<boolean>;
}

export const AddTimeOffModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [reason, setReason] = useState("");

  const handleOk = async () => {
    if (!range) return;
    const success = await onConfirm(range, reason);
    if (success) {
      setRange(null);
      setReason("");
    }
  };

  const handleCancel = () => {
    onClose();
    setRange(null);
    setReason("");
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: ACCENT }} />
          <span>Додати відгул</span>
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Додати"
      cancelText="Скасувати"
      okButtonProps={{
        disabled: !range,
        style: { backgroundColor: ACCENT, borderColor: ACCENT },
      }}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size={12}>
        <div>
          <Text strong>Період</Text>
          <DatePicker.RangePicker
            style={{ width: "100%", marginTop: 4 }}
            value={range}
            onChange={(v) => setRange(v as [Dayjs, Dayjs])}
            format="DD.MM.YYYY"
          />
        </div>
        <div>
          <Text strong>Причина (необов'язково)</Text>
          <Input
            style={{ marginTop: 4 }}
            placeholder="Хвороба, відпустка..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </Space>
    </Modal>
  );
};

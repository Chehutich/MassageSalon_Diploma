import React from "react";
import { Modal, Button, Space, ModalProps } from "antd";

interface SharedModalProps extends Omit<ModalProps, "footer"> {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  submitText?: string;
  cancelText?: string;
  subTitleId?: string | null;
  loading?: boolean;
  width?: number;
  children: React.ReactNode;
}

export const SharedModal: React.FC<SharedModalProps> = ({
  visible,
  onClose,
  onSave,
  title,
  submitText = "Зберегти",
  cancelText = "Скасувати",
  subTitleId,
  loading = false,
  width = 700,
  children,
  ...rest
}) => {
  return (
    <Modal
      {...rest}
      title={title}
      open={visible}
      onOk={onSave}
      onCancel={onClose}
      width={width}
      centered
      destroyOnClose
      confirmLoading={loading}
      styles={{
        body: {
          maxHeight: "75vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "12px 8px",
        },
      }}
      footer={[
        <div
          key="footer-content"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ color: "#bfbfbf", fontSize: "12px", paddingLeft: "8px" }}
          >
            {subTitleId ? `ID: ${subTitleId}` : ""}
          </div>
          <Space>
            <Button key="back" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={onSave}
              style={{ backgroundColor: "#0f766e", borderColor: "#0f766e" }}
            >
              {submitText}
            </Button>
          </Space>
        </div>,
      ]}
    >
      {children}
    </Modal>
  );
};

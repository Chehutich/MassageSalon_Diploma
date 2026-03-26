import React from "react";
import { Form, Input, Divider, Space } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Master } from "../../api/types";
import { SharedModal } from "../../components/shared/SharedModal";
import { Sanitizer } from "../../utils/sanitizer";
import { useEditMaster } from "./hooks/useEditMaster";
import { MasterServicesList } from "./components/MasterServicesList";
import { StatusSwitch } from "../../../src/components/shared/StatusSwitch";

interface Props {
  visible: boolean;
  master: Master | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditMasterModal: React.FC<Props> = ({
  visible,
  master,
  onClose,
  onSuccess,
}) => {
  const { form, services, loading, handleOk } = useEditMaster(
    visible,
    master,
    onSuccess,
    onClose,
  );

  const isActive = Form.useWatch("is_active", form);

  return (
    <SharedModal
      visible={visible}
      title={master ? "Налаштування профілю" : "Новий майстер"}
      subTitleId={master?.id}
      onClose={onClose}
      onSave={handleOk}
      loading={loading}
      width={700}
    >
      <Form form={form} layout="vertical">
        {master && (
          <StatusSwitch
            isActive={isActive}
            checkedText="Активний"
            uncheckedText="Деактивований"
            activeLabel="Майстер працює"
            inactiveLabel="Майстер звільнений"
          />
        )}

        <Divider plain style={{ marginTop: 0 }}>
          <UserOutlined /> Особисті дані
        </Divider>

        <Space style={{ display: "flex" }} align="start">
          <Form.Item
            name="firstName"
            label="Ім'я"
            rules={[
              { required: true, message: "Введіть ім'я" },
              { min: 2, message: "Занадто коротке" },
              { max: 50, message: "Занадто довге" },
            ]}
          >
            <Input
              placeholder="Олександр"
              onChange={(e) =>
                form.setFieldValue("firstName", Sanitizer.name(e.target.value))
              }
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Прізвище"
            rules={[
              { required: true, message: "Введіть прізвище" },
              { min: 2, message: "Занадто коротке" },
            ]}
          >
            <Input
              placeholder="Шевченко"
              onChange={(e) =>
                form.setFieldValue("lastName", Sanitizer.name(e.target.value))
              }
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Телефон"
            rules={[
              { required: true, message: "Вкажіть номер" },
              {
                pattern: /^\+?\d{10,15}$/,
                message: "Невірний формат (+380...)",
              },
            ]}
          >
            <Input
              placeholder="+380..."
              prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />}
              onChange={(e) =>
                form.setFieldValue("phone", Sanitizer.phone(e.target.value))
              }
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: "email", message: "Це не схоже на email" },
            { required: true, message: "Email потрібен для входу в систему" },
          ]}
        >
          <Input
            placeholder="master@example.com"
            prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
          />
        </Form.Item>

        <Divider plain>
          <BookOutlined /> Професійний профіль
        </Divider>

        <Form.Item
          name="bio"
          label="Біографія / Опис"
          rules={[{ max: 1000, message: "Опис занадто великий" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Досвід роботи, спеціалізація..."
            onChange={(e) =>
              form.setFieldValue("bio", Sanitizer.title(e.target.value))
            }
          />
        </Form.Item>

        <MasterServicesList services={services} />
      </Form>
    </SharedModal>
  );
};

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Checkbox,
  Divider,
  message,
  Space,
  Typography,
  Switch,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Master, Service } from "../../api/types";
import { SharedModal } from "../../components/shared/SharedModal";
import { Sanitizer } from "../../utils/sanitizer";

const { Text } = Typography;

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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  const isActive = Form.useWatch("is_active", form);

  useEffect(() => {
    if (visible) {
      loadInitialData();
      if (master) {
        const currentServiceIds =
          master.master_services?.map((ms) => ms.service_id) || [];
        form.setFieldsValue({
          firstName: master.users.first_name,
          lastName: master.users.last_name,
          is_active: master.is_active,
          phone: master.users.phone,
          email: master.users.email,
          bio: master.bio,
          serviceIds: currentServiceIds,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ is_active: true });
      }
    }
  }, [visible, master]);

  const loadInitialData = async () => {
    const res = await window.dbAPI.getServices();
    if (res.success) setServices(res.data || []);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        ...values,
        firstName: Sanitizer.name(values.firstName),
        lastName: Sanitizer.name(values.lastName),
        phone: Sanitizer.phone(values.phone),
        bio: values.bio?.trim(),
        is_active: values.is_active,
      };

      let res;
      if (master) {
        res = await window.dbAPI.updateMaster({ id: master.id, data: payload });
      } else {
        res = await window.dbAPI.createMaster(payload);
      }

      if (res.success) {
        message.success(master ? "Профіль оновлено" : "Майстра додано");
        onSuccess();
        onClose();
      } else {
        message.error(res.error);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                background: "#f5f5f5",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Form.Item name="is_active" valuePropName="checked" noStyle>
                <Switch
                  checkedChildren="Активний"
                  unCheckedChildren="Деактивований"
                  style={{ backgroundColor: isActive ? "#0f766e" : "#ff4d4f" }}
                />
              </Form.Item>
              <span style={{ marginLeft: 12, fontWeight: 500 }}>
                {isActive ? "Майстер працює" : "Майстер звільнений"}
              </span>
            </div>
          </Space>
        )}

        <Divider orientation="horizontal" plain style={{ marginTop: 0 }}>
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

        <Divider orientation="horizontal" plain>
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

        <Form.Item
          name="serviceIds"
          label="Послуги, які надає майстер"
          rules={[{ required: true, message: "Виберіть хоча б одну послугу" }]}
        >
          <Checkbox.Group style={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                maxHeight: "200px",
                overflowY: "auto",
                padding: "8px",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
              }}
            >
              {services.map((s) => (
                <Checkbox key={s.id} value={s.id} disabled={!s.is_active}>
                  <Text style={{ color: s.is_active ? "inherit" : "#bfbfbf" }}>
                    {s.title} {!s.is_active && "(неактивна)"}
                  </Text>
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </SharedModal>
  );
};

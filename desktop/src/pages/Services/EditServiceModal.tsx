import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Checkbox,
  Divider,
  Switch,
  Button,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { Service, Category, Master } from "../../api/types";
import { SharedModal } from "../../../src/components/shared/SharedModal";
import { Sanitizer } from "../../../src/utils/sanitizer";

interface EditServiceModalProps {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  visible,
  service,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allMasters, setAllMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(false);
  const isActive = Form.useWatch("is_active", form);

  useEffect(() => {
    if (visible) {
      loadInitialData();
      if (service) {
        const currentMasterIds =
          service.master_services?.map((ms) => ms.master_id) || [];
        form.setFieldsValue({
          ...service,
          masterIds: currentMasterIds,
          benefits: service.benefits || [],
        });
      }
    }
  }, [visible, service]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [mastRes, servRes] = await Promise.all([
        window.dbAPI.getMasters(),
        window.dbAPI.getServices(),
      ]);

      setAllMasters(mastRes.data || []);

      const uniqueCats = Array.from(
        new Map(
          servRes.data
            ?.filter((s) => s.categories)
            .map((s) => [s.categories!.id, s.categories!]),
        ).values(),
      );
      setCategories(uniqueCats as Category[]);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const { masterIds, ...serviceData } = values;

      const cleanedData = {
        ...serviceData,
        description: serviceData.description?.trim(),
        badge: serviceData.badge?.toUpperCase().trim(),
        masterIds,
      };

      let res;
      if (service?.id) {
        res = await window.dbAPI.updateService({
          id: service.id,
          data: cleanedData,
        });
      } else {
        res = await window.dbAPI.createService(cleanedData);
      }

      if (res.success) {
        message.success(service ? "Послугу оновлено" : "Послугу створено");
        onSuccess();
        onClose();
      } else {
        message.error(res.error);
      }
    } catch (error) {
      console.log("Validate Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SharedModal
      visible={visible}
      title="Налаштування послуги"
      subTitleId={service?.id}
      onClose={onClose}
      onSave={handleOk}
      width={750}
      loading={loading}
    >
      <Form form={form} layout="vertical">
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              marginBottom: 24,
              padding: "8px 12px",
              background: "#f5f5f5",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Form.Item name="is_active" valuePropName="checked" noStyle>
              <Switch
                checkedChildren="Активна"
                unCheckedChildren="Архів"
                style={{
                  backgroundColor: isActive ? "#0f766e" : "#ff4d4f",
                }}
              />
            </Form.Item>
            <span style={{ marginLeft: 12, fontWeight: 500 }}>
              {isActive ? "Активна в меню" : "В архіві (прихована)"}
            </span>
          </div>
        </Space>

        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="title"
            label="Назва"
            rules={[{ required: true }]}
            style={{ flex: 2 }}
          >
            <Input
              placeholder="Класичний масаж"
              onChange={(e) => {
                form.setFieldValue("title", Sanitizer.title(e.target.value));
              }}
            />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="Категорія"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Оберіть категорію"
              options={categories.map((c) => ({ label: c.title, value: c.id }))}
              suffixIcon={<FolderOutlined />}
            />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[
              { required: true, message: "Слаг обов'язковий" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Тільки малі латинські літери, цифри та дефіс",
              },
              {
                validator: (_, value) => {
                  if (value && (value.startsWith("-") || value.endsWith("-"))) {
                    return Promise.reject(
                      "Дефіс не може бути на початку або в кінці",
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="classic-massage"
              onChange={(e) => {
                form.setFieldValue("slug", Sanitizer.slug(e.target.value));
              }}
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Ціна"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: "Вкажіть ціну" },
              {
                type: "number",
                min: 0,
                message: "Ціна не може бути від'ємною",
              },
            ]}
          >
            <InputNumber
              placeholder="0"
              style={{ width: "100%" }}
              min={0}
              max={1000000}
              precision={0}
              prefix="₴"
            />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Час (хв)"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: "Вкажіть час" },
              { type: "number", min: 5, message: "Мінімум 5 хв" },
              { type: "number", max: 480, message: "Максимум 8 годин" },
            ]}
          >
            <InputNumber
              placeholder="0"
              style={{ width: "100%" }}
              min={1}
              step={5}
            />
          </Form.Item>
          <Form.Item name="badge" label="Бейдж" style={{ flex: 1 }}>
            <Input
              placeholder="HIT"
              onChange={(e) =>
                form.setFieldValue("badge", e.target.value.toUpperCase())
              }
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Опис">
          <Input.TextArea placeholder="Опис послуги" rows={2} />
        </Form.Item>

        <Divider orientation="horizontal" plain>
          Переваги (Benefits)
        </Divider>
        <Form.List name="benefits">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[
                      {
                        required: true,
                        message: "Введіть текст або видаліть",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Введіть перевагу"
                      style={{ width: 600 }}
                      onChange={(e) =>
                        form.setFieldValue(
                          ["benefits", name],
                          Sanitizer.title(e.target.value),
                        )
                      }
                    />
                  </Form.Item>
                  <DeleteOutlined
                    onClick={() => remove(name)}
                    style={{ color: "#ff4d4f" }}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Додати перевагу
              </Button>
            </>
          )}
        </Form.List>

        <Divider orientation="horizontal" plain>
          Майстри
        </Divider>
        <Form.Item name="masterIds">
          <Checkbox.Group style={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
              }}
            >
              {allMasters.map((m) => (
                <Checkbox key={m.id} value={m.id}>
                  {m.users.first_name} {m.users.last_name}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </SharedModal>
  );
};

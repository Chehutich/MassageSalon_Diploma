import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Switch,
  Space,
  Divider,
  message,
  List,
  Button,
} from "antd";
import {
  ArrowRightOutlined,
  FolderOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import { Category, NavigateFn, Service, TAB_KEYS } from "../../api/types";
import { SharedModal } from "../../components/shared/SharedModal";
import { Sanitizer } from "../../utils/sanitizer";

interface Props {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
  onNavigate: NavigateFn;
}

export const EditCategoryModal: React.FC<Props> = ({
  visible,
  category,
  onClose,
  onSuccess,
  onNavigate,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [categoryServices, setCategoryServices] = useState<Service[]>([]);
  const isActive = Form.useWatch("is_active", form);

  useEffect(() => {
    if (visible) {
      if (category) {
        form.setFieldsValue(category);
      } else {
        form.resetFields();
        form.setFieldsValue({ is_active: true });
      }
    }
  }, [visible, category]);

  useEffect(() => {
    if (visible && category) {
      loadServices();
    }
  }, [visible, category]);

  const loadServices = async () => {
    if (!category) return;
    setLoadingServices(true);
    const res = await window.dbAPI.getServices();
    if (res.success) {
      setCategoryServices(
        res.data?.filter((s) => s.category_id === category.id) || [],
      );
    }
    setLoadingServices(false);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ...values,
        title: Sanitizer.title(values.title),
        slug: Sanitizer.slug(values.slug),
      };

      let res;
      if (category) {
        res = await window.dbAPI.updateCategory({
          id: category.id,
          data: payload,
        });
      } else {
        res = await window.dbAPI.createCategory(payload);
      }

      if (res.success) {
        message.success("Збережено успішно");
        onSuccess();
        onClose();
      } else {
        message.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SharedModal
      visible={visible}
      title={category ? "Редагувати категорію" : "Нова категорія"}
      onClose={onClose}
      onSave={handleOk}
      loading={loading}
      width={500}
    >
      <Form form={form} layout="vertical">
        {category && (
          <div
            style={{
              marginBottom: 16,
              padding: "8px 12px",
              background: "#f5f5f5",
              borderRadius: 8,
            }}
          >
            <Form.Item name="is_active" valuePropName="checked" noStyle>
              <Switch
                size="small"
                style={{ backgroundColor: isActive ? "#0f766e" : "#ff4d4f" }}
              />
            </Form.Item>
            <span style={{ marginLeft: 12, fontWeight: 500 }}>
              {isActive ? "Активна категорія" : "В архіві"}
            </span>
          </div>
        )}

        <Form.Item
          name="title"
          label="Назва"
          rules={[{ required: true, message: "Введіть назву" }]}
        >
          <Input
            placeholder="Масаж"
            onChange={(e) => {
              const val = Sanitizer.title(e.target.value);
              form.setFieldValue("title", val);
              if (!category) {
                form.setFieldValue("slug", Sanitizer.slug(val));
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug (URL)"
          rules={[
            {
              required: true,
              pattern: /^[a-z0-9-]+$/,
              message: "Тільки малі латинські літери та дефіс",
            },
          ]}
        >
          <Input
            placeholder="massage"
            onChange={(e) =>
              form.setFieldValue("slug", Sanitizer.slug(e.target.value))
            }
          />
        </Form.Item>
        {category && (
          <>
            <Divider orientation="horizontal" plain>
              <ScissorOutlined /> Послуги в цій категорії
            </Divider>

            <List
              loading={loadingServices}
              size="small"
              bordered
              dataSource={categoryServices}
              locale={{ emptyText: "У цій категорії ще немає послуг" }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<ArrowRightOutlined />}
                      onClick={() => {
                        onNavigate(TAB_KEYS.services, {
                          id: item.id,
                          type: "service",
                        });
                        onClose();
                      }}
                    >
                      Перейти
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={`${item.price} грн · ${item.duration} хв`}
                  />
                </List.Item>
              )}
              style={{ maxHeight: 200, overflowY: "auto", borderRadius: 8 }}
            />
          </>
        )}
      </Form>
    </SharedModal>
  );
};

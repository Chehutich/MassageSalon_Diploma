import React from "react";
import { Form, Input, InputNumber, Select, Divider } from "antd";
import { FolderOutlined } from "@ant-design/icons";
import { Service } from "../../api/types";
import { SharedModal } from "../../../src/components/shared/SharedModal";
import { Sanitizer } from "../../../src/utils/sanitizer";
import { useEditService } from "./hooks/useEditService";
import { ServiceBenefitsList } from "./components/ServiceBenefitsList";
import { ServiceMastersList } from "./components/ServiceMastersList";
import { StatusSwitch } from "../../../src/components/shared/StatusSwitch";

interface Props {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditServiceModal: React.FC<Props> = ({
  visible,
  service,
  onClose,
  onSuccess,
}) => {
  const { form, categories, allMasters, loading, handleOk } = useEditService(
    visible,
    service,
    onSuccess,
    onClose,
  );

  const isActive = Form.useWatch("is_active", form);

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
        {service && (
          <StatusSwitch
            isActive={isActive}
            checkedText="Активна"
            uncheckedText="Архів"
            activeLabel="Активна в меню"
            inactiveLabel="В архіві (прихована)"
          />
        )}

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="title"
            label="Назва"
            rules={[{ required: true }]}
            style={{ flex: 2 }}
          >
            <Input
              placeholder="Класичний масаж"
              onChange={(e) =>
                form.setFieldValue("title", Sanitizer.title(e.target.value))
              }
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
              suffixIcon={<FolderOutlined />}
              options={[
                ...categories.map((c) => ({ label: c.title, value: c.id })),
                ...(service?.categories && !service.categories.is_active
                  ? [
                      {
                        label: `${service.categories.title} (архів)`,
                        value: service.categories.id,
                        disabled: true,
                      },
                    ]
                  : []),
              ]}
            />
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
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
                validator: (_, v) =>
                  !v || v.startsWith("-") || v.endsWith("-")
                    ? Promise.reject(
                        "Дефіс не може бути на початку або в кінці",
                      )
                    : Promise.resolve(),
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="classic-massage"
              onChange={(e) =>
                form.setFieldValue("slug", Sanitizer.slug(e.target.value))
              }
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Ціна"
            rules={[{ required: true, message: "Вкажіть ціну" }]}
            style={{ flex: 1 }}
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
            rules={[
              { required: true, message: "Вкажіть час" },
              { type: "number", min: 5, message: "Мінімум 5 хв" },
              { type: "number", max: 480, message: "Максимум 8 годин" },
            ]}
            style={{ flex: 1 }}
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
                form.setFieldValue("badge", Sanitizer.title(e.target.value))
              }
            />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Опис">
          <Input.TextArea placeholder="Опис послуги" rows={2} />
        </Form.Item>

        <Divider plain>Переваги (Benefits)</Divider>
        <ServiceBenefitsList />

        <Divider plain>Майстри</Divider>
        <ServiceMastersList masters={allMasters} />
      </Form>
    </SharedModal>
  );
};

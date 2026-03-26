import React from "react";
import { Form, Input } from "antd";
import { Category, NavigateFn } from "../../api/types";
import { SharedModal } from "../../components/shared/SharedModal";
import { Sanitizer } from "../../utils/sanitizer";
import { useEditCategory } from "./hooks/useEditCategory";
import { CategoryServicesList } from "./components/CategoryServicesList";
import { StatusSwitch } from "../../../src/components/shared/StatusSwitch";

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
  const { form, loading, loadingServices, categoryServices, handleOk } =
    useEditCategory(visible, category, onSuccess, onClose);

  const isActive = Form.useWatch("is_active", form);

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
          <StatusSwitch
            isActive={isActive}
            size="small"
            activeLabel="Активна категорія"
            inactiveLabel="В архіві"
          />
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
              if (!category) form.setFieldValue("slug", Sanitizer.slug(val));
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
          <CategoryServicesList
            services={categoryServices}
            loading={loadingServices}
            onNavigate={onNavigate}
            onClose={onClose}
          />
        )}
      </Form>
    </SharedModal>
  );
};

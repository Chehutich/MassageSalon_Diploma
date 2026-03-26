import { useEffect, useState } from "react";
import { Form, message } from "antd";
import { Category, Service } from "../../../api/types";
import { Sanitizer } from "../../../utils/sanitizer";

export const useEditCategory = (
  visible: boolean,
  category: Category | null,
  onSuccess: () => void,
  onClose: () => void,
) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [categoryServices, setCategoryServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!visible) return;
    if (category) {
      form.setFieldsValue(category);
      loadServices();
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true });
      setCategoryServices([]);
    }
  }, [visible, category]);

  const loadServices = async () => {
    if (!category) return;
    setLoadingServices(true);
    const res = await window.dbAPI.getServices();
    if (res.success)
      setCategoryServices(
        res.data?.filter((s) => s.category_id === category.id) ?? [],
      );
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

      const res = category
        ? await window.dbAPI.updateCategory({ id: category.id, data: payload })
        : await window.dbAPI.createCategory(payload);

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

  return { form, loading, loadingServices, categoryServices, handleOk };
};

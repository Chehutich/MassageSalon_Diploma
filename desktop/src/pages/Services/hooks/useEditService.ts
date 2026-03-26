import { useEffect, useState } from "react";
import { Form, message } from "antd";
import { Service, Category, Master } from "../../../api/types";

export const useEditService = (
  visible: boolean,
  service: Service | null,
  onSuccess: () => void,
  onClose: () => void,
) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allMasters, setAllMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    loadInitialData();
    if (service) {
      form.setFieldsValue({
        ...service,
        masterIds: service.master_services?.map((ms) => ms.master_id) ?? [],
        benefits: service.benefits ?? [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true, benefits: [], masterIds: [] });
    }
  }, [visible, service]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [mastRes, catRes] = await Promise.all([
        window.dbAPI.getMasters(),
        window.dbAPI.getCategories(),
      ]);
      setAllMasters(mastRes.data ?? []);
      setCategories((catRes.data ?? []).filter((c: Category) => c.is_active));
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
        badge: serviceData.badge?.trim(),
        masterIds,
      };

      const res = service?.id
        ? await window.dbAPI.updateService({
            id: service.id,
            data: cleanedData,
          })
        : await window.dbAPI.createService(cleanedData);

      if (res.success) {
        message.success(service ? "Послугу оновлено" : "Послугу створено");
        onSuccess();
        onClose();
      } else {
        message.error(res.error);
      }
    } catch (e) {
      console.log("Validate Failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { form, categories, allMasters, loading, handleOk };
};

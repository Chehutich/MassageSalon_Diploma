import { useEffect, useState } from "react";
import { Form, message } from "antd";
import { Master, Service } from "../../../api/types";
import { Sanitizer } from "../../../utils/sanitizer";

export const useEditMaster = (
  visible: boolean,
  master: Master | null,
  onSuccess: () => void,
  onClose: () => void,
) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    loadInitialData();
    if (master) {
      form.setFieldsValue({
        firstName: master.users.first_name,
        lastName: master.users.last_name,
        is_active: master.is_active,
        phone: master.users.phone,
        email: master.users.email,
        bio: master.bio,
        serviceIds: master.master_services?.map((ms) => ms.service_id) ?? [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true });
    }
  }, [visible, master]);

  const loadInitialData = async () => {
    const res = await window.dbAPI.getServices();
    if (res.success) setServices(res.data ?? []);
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
      };

      const res = master
        ? await window.dbAPI.updateMaster({ id: master.id, data: payload })
        : await window.dbAPI.createMaster(payload);

      if (res.success) {
        message.success(master ? "Профіль оновлено" : "Майстра додано");
        onSuccess();
        onClose();
      } else {
        message.error(res.error);
      }
    } catch (e) {
      console.error("Validation failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { form, services, loading, handleOk };
};

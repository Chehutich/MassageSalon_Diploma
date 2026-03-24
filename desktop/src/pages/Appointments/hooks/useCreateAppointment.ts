import { useEffect, useMemo, useRef, useState } from "react";
import { Form, message } from "antd";
import { AvailableSlot, Master, Service, User } from "../../../api/types";

export const useCreateAppointment = (
  visible: boolean,
  onSuccess: () => void,
  onClose: () => void,
) => {
  const [form] = Form.useForm();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [allMasters, setAllMasters] = useState<Master[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);

  const [foundClient, setFoundClient] = useState<User | null>(null);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [searchingPhone, setSearchingPhone] = useState(false);
  const phoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedMaster = Form.useWatch("masterId", form);
  const selectedService = Form.useWatch("serviceId", form);
  const selectedDate = Form.useWatch("date", form);

  useEffect(() => {
    if (visible) {
      Promise.all([window.dbAPI.getMasters(), window.dbAPI.getServices()]).then(
        ([mRes, sRes]) => {
          setAllMasters(mRes.data || []);
          setAllServices(sRes.data || []);
        },
      );
    } else {
      form.resetFields();
      setSlots([]);
      setFoundClient(null);
      setSuggestions([]);
    }
  }, [visible, form]);

  const confirmClient = (user: User) => {
    setFoundClient(user);
    setSuggestions([]);
    form.setFieldsValue({
      phone: user.phone || "",
      firstName: user.first_name,
      lastName: user.last_name,
    });
    message.success(`Клієнт обраний: ${user.first_name} ${user.last_name}`);
  };

  const resetClient = () => {
    setFoundClient(null);
    setSuggestions([]);
    form.setFieldsValue({ phone: "", firstName: "", lastName: "" });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.trim();
    if (foundClient) return;

    setSuggestions([]);
    if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current);
    if (phone.length < 5) return;

    phoneTimerRef.current = setTimeout(async () => {
      setSearchingPhone(true);
      try {
        const res = await window.dbAPI.searchClients(phone);
        const users: User[] = res.data || [];
        if (!users.length) return;

        const exactMatch = users.find((u) => u.phone === phone);
        if (exactMatch) {
          confirmClient(exactMatch);
        } else {
          setSuggestions(users.slice(0, 5));
        }
      } finally {
        setSearchingPhone(false);
      }
    }, 500);
  };

  const filteredMasters = useMemo(() => {
    if (!selectedService) return allMasters;
    return allMasters.filter((m) =>
      m.master_services?.some((ms) => ms.service_id === selectedService),
    );
  }, [selectedService, allMasters]);

  const filteredServices = useMemo(() => {
    if (!selectedMaster) return allServices;
    return allServices.filter((s) =>
      s.master_services?.some((ms) => ms.master_id === selectedMaster),
    );
  }, [selectedMaster, allServices]);

  useEffect(() => {
    if (selectedMaster && selectedService && selectedDate) {
      setLoadingSlots(true);
      form.setFieldValue("slot", undefined);
      window.dbAPI
        .getAvailableSlots({
          masterId: selectedMaster,
          serviceId: selectedService,
          date: selectedDate.toISOString(),
        })
        .then((res) => {
          setSlots(res.data || []);
          setLoadingSlots(false);
        });
    } else {
      setSlots([]);
    }
  }, [selectedMaster, selectedService, selectedDate, form]);

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      const result = await window.dbAPI.createGuestAppointment({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        existingClientId: foundClient?.id ?? null,
        masterId: values.masterId,
        serviceId: values.serviceId,
        startTime: values.slot.start,
        actualPrice: values.actualPrice,
        clientNotes: values.clientNotes ?? null,
      });

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        message.error(result.error);
      }
    } catch (e) {
      console.log("Validation failed", e);
    }
  };

  return {
    form,
    slots,
    loadingSlots,
    filteredMasters,
    filteredServices,
    foundClient,
    suggestions,
    searchingPhone,
    handlePhoneChange,
    confirmClient,
    resetClient,
    submitForm,
  };
};

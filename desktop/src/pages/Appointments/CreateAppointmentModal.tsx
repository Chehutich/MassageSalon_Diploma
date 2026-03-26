import React from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  Tag,
  List,
  Card,
  Spin,
  Alert,
} from "antd";
import { UserOutlined, CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { SlotPicker } from "./SlotPicker";
import { useCreateAppointment } from "./hooks/useCreateAppointment";
import { SharedModal } from "../../../src/components/shared/SharedModal";
import { Sanitizer } from "../../../src/utils/sanitizer";

interface CreateAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ServiceOption {
  label: string;
  value: string;
  price: number | string;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const {
    form,
    slots,
    loadingSlots,
    slotsReason,
    filteredMasters,
    filteredServices,
    foundClient,
    suggestions,
    searchingPhone,
    handlePhoneChange,
    confirmClient,
    resetClient,
    submitForm,
  } = useCreateAppointment(visible, onSuccess, onClose);

  const isClientLocked = !!foundClient;

  return (
    <SharedModal
      visible={visible}
      title="Новий запис"
      submitText="Створити запис"
      onClose={onClose}
      onSave={submitForm}
      width={650}
    >
      <Form form={form} layout="vertical" initialValues={{ date: dayjs() }}>
        <Form.Item
          name="phone"
          label="Телефон клієнта"
          rules={[
            { required: true, message: "Введіть телефон" },
            { min: 10, message: "Номер занадто короткий" },
          ]}
        >
          <Input
            placeholder="+380..."
            prefix={<UserOutlined />}
            suffix={
              searchingPhone ? (
                <Spin size="small" />
              ) : isClientLocked ? (
                <CheckCircleFilled style={{ color: "#0f766e" }} />
              ) : null
            }
            onChange={(e) => {
              const cleaned = Sanitizer.phone(e.target.value);
              form.setFieldValue("phone", cleaned);
              handlePhoneChange(e);
            }}
            disabled={isClientLocked}
          />
        </Form.Item>

        {/* Suggestions */}
        {suggestions.length > 0 && !isClientLocked && (
          <Card
            size="small"
            style={{
              marginTop: -12,
              marginBottom: 16,
              border: "1px solid #b7eb8f",
              borderRadius: 8,
            }}
          >
            <List
              size="small"
              dataSource={suggestions}
              renderItem={(u) => (
                <List.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => confirmClient(u)}
                >
                  <span style={{ fontWeight: 500 }}>
                    {u.first_name} {u.last_name}
                  </span>
                  <Tag style={{ marginLeft: 8 }}>{u.phone}</Tag>
                </List.Item>
              )}
            />
          </Card>
        )}

        {isClientLocked && (
          <div style={{ marginTop: -12, marginBottom: 12 }}>
            <Tag
              color="success"
              icon={<CheckCircleFilled />}
              closable
              onClose={resetClient}
            >
              {foundClient.first_name} {foundClient.last_name} ·{" "}
              {foundClient.phone}
            </Tag>
          </div>
        )}

        {/* Client details */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="firstName"
            label="Ім'я"
            rules={[
              { required: true, message: "Введіть ім'я" },
              { min: 2, message: "Мінімум 2 символи" },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="Iм'я клієнта"
              disabled={isClientLocked}
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
              { min: 2, message: "Мінімум 2 символи" },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              placeholder="Прізвище клієнта"
              disabled={isClientLocked}
              onChange={(e) =>
                form.setFieldValue("lastName", Sanitizer.name(e.target.value))
              }
            />
          </Form.Item>
        </div>

        <Divider style={{ margin: "4px 0 16px" }} />

        {/* Choose service and master */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="serviceId"
            label="Послуга"
            rules={[{ required: true, message: "Оберіть послугу" }]}
            style={{ flex: 1 }}
          >
            <Select<string, ServiceOption>
              placeholder="Оберіть послугу"
              options={filteredServices
                .filter((s) => s.is_active)
                .map((s) => ({
                  label: s.title,
                  value: s.id,
                  price: s.price,
                }))}
              onChange={(_, option) => {
                const opt = option as ServiceOption;
                if (opt) {
                  form.setFieldsValue({ actualPrice: opt.price });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name="masterId"
            label="Майстер"
            rules={[{ required: true, message: "Оберіть майстра" }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Оберіть майстра"
              options={filteredMasters
                .filter((m) => m.is_active)
                .map((m) => ({
                  label: `${m.users.first_name} ${m.users.last_name}`,
                  value: m.id,
                }))}
            />
          </Form.Item>
        </div>

        {/* Date and time */}
        <Form.Item
          name="date"
          label="Дата візиту"
          rules={[{ required: true, message: "Оберіть дату" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD.MM.YYYY"
            disabledDate={(d) => d.isBefore(dayjs(), "day")}
          />
        </Form.Item>

        <Form.Item
          name="slot"
          label="Доступний час"
          rules={[{ required: true, message: "Оберіть час" }]}
        >
          {slotsReason === "time_off" ? (
            <Alert
              type="warning"
              showIcon
              title="Майстер у відпустці цього дня"
              description="Оберіть іншу дату або іншого майстра"
            />
          ) : slotsReason === "day_off" ? (
            <Alert
              type="info"
              showIcon
              title="Вихідний день у майстра"
              description="Майстер не працює в цей день тижня"
            />
          ) : (
            <SlotPicker slots={slots} loading={loadingSlots} />
          )}
        </Form.Item>

        {/* Financial details */}
        <Form.Item
          name="actualPrice"
          label="Сума до сплати (грн)"
          rules={[{ required: true, min: 0 }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} disabled />
        </Form.Item>

        <Form.Item name="clientNotes" label="Нотатки клієнта">
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Особливі побажання..."
            style={{ borderRadius: 8 }}
            onChange={(e) =>
              form.setFieldValue("clientNotes", Sanitizer.title(e.target.value))
            }
          />
        </Form.Item>
      </Form>
    </SharedModal>
  );
};

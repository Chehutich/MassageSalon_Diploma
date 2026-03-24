import React from "react";
import {
  Modal,
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
} from "antd";
import { UserOutlined, CheckCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { SlotPicker } from "./SlotPicker";
import { useCreateAppointment } from "./hooks/useCreateAppointment";

interface CreateAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
    <Modal
      title="Новий запис"
      open={visible}
      onOk={submitForm}
      onCancel={onClose}
      width={650}
      centered
      destroyOnHidden
      okText="Створити запис"
      cancelText="Скасувати"
      styles={{
        body: {
          maxHeight: "75vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "12px 8px",
        },
      }}
    >
      <Form form={form} layout="vertical" initialValues={{ date: dayjs() }}>
        {/* Find and confirm client */}
        <Form.Item
          name="phone"
          label="Телефон клієнта"
          rules={[{ required: true, message: "Введіть телефон" }]}
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
            onChange={handlePhoneChange}
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
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Input disabled={isClientLocked} />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Прізвище"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Input disabled={isClientLocked} />
          </Form.Item>
        </div>

        <Divider style={{ margin: "4px 0 16px" }} />

        {/* Choose service and master */}
        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="serviceId"
            label="Послуга"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Оберіть послугу"
              options={filteredServices.map((s) => ({
                label: s.title,
                value: s.id,
                price: s.price,
              }))}
              onChange={(_, opt: any) =>
                form.setFieldsValue({ actualPrice: opt.price })
              }
            />
          </Form.Item>
          <Form.Item
            name="masterId"
            label="Майстер"
            rules={[{ required: true }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Оберіть майстра"
              options={filteredMasters.map((m) => ({
                label: `${m.users.first_name} ${m.users.last_name}`,
                value: m.id,
              }))}
            />
          </Form.Item>
        </div>

        {/* Date and time */}
        <Form.Item name="date" label="Дата візиту" rules={[{ required: true }]}>
          <DatePicker
            style={{ width: "100%" }}
            format="DD.MM.YYYY"
            disabledDate={(d) => d.isBefore(dayjs(), "day")}
          />
        </Form.Item>

        <Form.Item
          name="slot"
          label="Доступний час"
          rules={[{ required: true }]}
        >
          <SlotPicker slots={slots} loading={loadingSlots} />
        </Form.Item>

        {/* Financial details */}
        <Form.Item name="actualPrice" label="Сума до сплати (грн)">
          <InputNumber style={{ width: "100%" }} min={0} disabled />
        </Form.Item>

        <Form.Item name="clientNotes" label="Нотатки клієнта">
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Особливі побажання..."
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

import React from "react";
import { Form, Checkbox, Typography } from "antd";
import { Service } from "../../../api/types";

const { Text } = Typography;

interface Props {
  services: Service[];
}

export const MasterServicesList: React.FC<Props> = ({ services }) => (
  <Form.Item
    name="serviceIds"
    label="Послуги, які надає майстер"
    rules={[{ required: true, message: "Виберіть хоча б одну послугу" }]}
  >
    <Checkbox.Group style={{ width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          maxHeight: 200,
          overflowY: "auto",
          padding: 8,
          border: "1px solid #f0f0f0",
          borderRadius: 8,
        }}
      >
        {services.map((s) => (
          <Checkbox key={s.id} value={s.id} disabled={!s.is_active}>
            <Text style={{ color: s.is_active ? "inherit" : "#bfbfbf" }}>
              {s.title} {!s.is_active && "(неактивна)"}
            </Text>
          </Checkbox>
        ))}
      </div>
    </Checkbox.Group>
  </Form.Item>
);

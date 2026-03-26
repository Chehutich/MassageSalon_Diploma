import React from "react";
import { Form, Checkbox } from "antd";
import { Master } from "../../../api/types";

interface Props {
  masters: Master[];
}

export const ServiceMastersList: React.FC<Props> = ({ masters }) => (
  <Form.Item name="masterIds">
    <Checkbox.Group style={{ width: "100%" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}
      >
        {masters.map((m) => (
          <Checkbox key={m.id} value={m.id}>
            {m.users.first_name} {m.users.last_name}
          </Checkbox>
        ))}
      </div>
    </Checkbox.Group>
  </Form.Item>
);

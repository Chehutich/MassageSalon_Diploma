import React from "react";
import { Form, Input, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Sanitizer } from "../../../../src/utils/sanitizer";

export const ServiceBenefitsList: React.FC = () => {
  const form = Form.useFormInstance();

  return (
    <Form.List name="benefits">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space
              key={key}
              style={{ display: "flex", marginBottom: 8 }}
              align="baseline"
            >
              <Form.Item
                {...restField}
                name={name}
                rules={[
                  { required: true, message: "Введіть текст або видаліть" },
                ]}
              >
                <Input
                  placeholder="Введіть перевагу"
                  style={{ width: 600 }}
                  onChange={(e) =>
                    form.setFieldValue(
                      ["benefits", name],
                      Sanitizer.title(e.target.value),
                    )
                  }
                />
              </Form.Item>
              <DeleteOutlined
                onClick={() => remove(name)}
                style={{ color: "#ff4d4f" }}
              />
            </Space>
          ))}
          <Button
            type="dashed"
            onClick={() => add()}
            block
            icon={<PlusOutlined />}
          >
            Додати перевагу
          </Button>
        </>
      )}
    </Form.List>
  );
};

import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { LockOutlined, UserOutlined, ScissorOutlined } from "@ant-design/icons";
import { User } from "../../api/types";

const { Title, Text } = Typography;
const ACCENT = "#0f766e";

interface LoginFormValues {
  email: string;
  password?: string;
}

interface Props {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await window.dbAPI.login(
        values.email,
        values.password || "",
      );

      if (result.success && result.data) {
        message.success(`Ласкаво просимо, ${result.data.first_name}!`);
        onLoginSuccess(result.data);
      } else {
        message.error(result.error || "Помилка входу");
      }
    } catch (err) {
      message.error("Помилка з'єднання");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0fafa",
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <ScissorOutlined style={{ fontSize: 28, color: "#fff" }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            Massage Salon
          </Title>
          <Text type="secondary">Адміністративна панель</Text>
        </div>

        <Form
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ email: "" }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Будь ласка, введіть Email!" },
              {
                type: "email",
                message: "Введіть коректну адресу електронної пошти!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: ACCENT }} />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Будь ласка, введіть пароль!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: ACCENT }} />}
              placeholder="Пароль"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              backgroundColor: ACCENT,
              height: 44,
              border: "none",
              marginTop: 8,
            }}
          >
            Увійти
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;

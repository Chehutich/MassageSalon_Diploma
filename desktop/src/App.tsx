import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Divider } from "antd";
import { LockOutlined, UserOutlined, ScissorOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ACCENT = "#0f766e";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState("");

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const result = await (window as any).dbAPI.login(
        values.email,
        values.password,
      );

      if (result.success) {
        message.success(`Ласкаво просимо, ${result.user.name}!`);
        setAdminName(result.user.name);
        setIsLoggedIn(true);
      } else {
        message.error(result.error || "Помилка входу");
      }
    } catch (err) {
      message.error("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
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
            width: 400,
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <ScissorOutlined style={{ fontSize: 44, color: ACCENT }} />
          <Title level={3} style={{ marginTop: 16 }}>
            Панель адміністратора
          </Title>
          <Text type="secondary">Увійшли як {adminName}</Text>
          <Divider />
          <Button
            danger
            block
            size="large"
            style={{ borderRadius: 8 }}
            onClick={() => setIsLoggedIn(false)}
          >
            Вийти
          </Button>
        </Card>
      </div>
    );
  }

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
          padding: "8px 0",
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

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Введіть Email!" },
              { type: "email", message: "Невірний формат Email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: ACCENT }} />}
              placeholder="Email адміністратора"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введіть пароль!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: ACCENT }} />}
              placeholder="Пароль"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                borderRadius: 8,
                height: 44,
                backgroundColor: ACCENT,
                border: "none",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {loading ? "Перевірка..." : "Увійти"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default App;

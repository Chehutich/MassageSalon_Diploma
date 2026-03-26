import React, { useState } from "react";
import { Layout, Menu, Button, Typography } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  LogoutOutlined,
  ScissorOutlined,
  TagsOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { TAB_KEYS } from "../../src/api/types";

const { Sider, Content } = Layout;
const { Text } = Typography;
const ACCENT = "#0f766e";

interface Props {
  children: React.ReactNode;
  adminName: string;
  onLogout: () => void;
  onMenuClick: (key: string) => void;
  activeKey: string;
}

const MENU_ITEMS = [
  { key: TAB_KEYS.appointments, icon: <CalendarOutlined />, label: "Записи" },
  { key: TAB_KEYS.clients, icon: <UserOutlined />, label: "Клієнти" },
  { key: TAB_KEYS.masters, icon: <TeamOutlined />, label: "Майстри" },
  { key: TAB_KEYS.services, icon: <ScissorOutlined />, label: "Послуги" },
  { key: TAB_KEYS.categories, icon: <TagsOutlined />, label: "Категорії" },
  { key: TAB_KEYS.schedule, icon: <CalendarOutlined />, label: "Розклад" },
];

const MainLayout: React.FC<Props> = ({
  children,
  adminName,
  onLogout,
  onMenuClick,
  activeKey,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        collapsedWidth={64}
        style={{
          boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
          zIndex: 10,
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Logo */}
          <div
            style={{
              padding: collapsed ? "20px 12px" : "20px 16px",
              textAlign: "center",
              borderBottom: "1px solid #f0f0f0",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: ACCENT,
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ScissorOutlined style={{ fontSize: 22, color: "#fff" }} />
            </div>
            {!collapsed && (
              <div
                style={{
                  fontWeight: 800,
                  color: ACCENT,
                  letterSpacing: 1,
                  marginTop: 8,
                  fontSize: 13,
                }}
              >
                SALON ADMIN
              </div>
            )}
          </div>

          {/* Menu */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <Menu
              mode="inline"
              selectedKeys={[activeKey]}
              onClick={({ key }) => onMenuClick(key)}
              style={{ borderRight: 0 }}
              items={MENU_ITEMS}
            />
          </div>

          {/* User info + logout */}
          {!collapsed && (
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #f0f0f0",
                flexShrink: 0,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Адмін
                </Text>
                <br />
                <Text strong style={{ fontSize: 13 }}>
                  {adminName}
                </Text>
              </div>
              <Button
                icon={<LogoutOutlined />}
                danger
                block
                type="text"
                onClick={onLogout}
                style={{ textAlign: "left", padding: "4px 8px" }}
              >
                Вийти
              </Button>
            </div>
          )}
        </div>
      </Sider>

      <Layout style={{ backgroundColor: "#f5f7f9" }}>
        <Content
          style={{
            margin: "24px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px",
              overflow: "auto",
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              scrollbarGutter: "stable",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

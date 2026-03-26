import React, { useState } from "react";
import { ConfigProvider } from "antd";
import ukUA from "antd/locale/uk_UA";
import LoginPage from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import { AppRouter } from "./AppRouter";
import { TAB_KEYS, TabKey, type NavParams } from "./api/types";

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.appointments);
  const [navParams, setNavParams] = useState<NavParams | null>(null);

  const navigateTo = (tabKey: TabKey, params?: NavParams) => {
    setNavParams(params ?? null);
    setActiveTab(tabKey);
  };

  const handleMenuChange = (key: TabKey) => {
    setActiveTab(key);
    setNavParams(null);
  };

  return (
    <ConfigProvider locale={ukUA}>
      {!user ? (
        <LoginPage
          onLoginSuccess={(userData) => setUser({ name: userData.last_name })}
        />
      ) : (
        <MainLayout
          adminName={user.name}
          activeKey={activeTab}
          onLogout={() => setUser(null)}
          onMenuClick={handleMenuChange}
        >
          <AppRouter
            activeTab={activeTab}
            navParams={navParams}
            onNavigate={navigateTo}
            onHandled={() => setNavParams(null)}
          />
        </MainLayout>
      )}
    </ConfigProvider>
  );
};

export default App;

import React, { useState } from "react";
import { ConfigProvider } from "antd";
import ukUA from "antd/locale/uk_UA";
import LoginPage from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import AppointmentsPage from "./pages/Appointments";

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState("1");

  const handleLogout = () => {
    setUser(null);
    setActiveTab("1");
  };

  return (
    <ConfigProvider locale={ukUA}>
      {!user ? (
        <LoginPage onLoginSuccess={(userData) => setUser(userData)} />
      ) : (
        <MainLayout
          adminName={user.name}
          onLogout={handleLogout}
          activeKey={activeTab}
          onMenuClick={(key) => setActiveTab(key)}
        >
          {activeTab === "1" && <AppointmentsPage />}
          {activeTab === "2" && <div>Сторінка майстрів</div>}
          {activeTab === "3" && <div>Сторінка послуг</div>}
        </MainLayout>
      )}
    </ConfigProvider>
  );
};

export default App;

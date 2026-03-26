import React, { useState } from "react";
import { ConfigProvider } from "antd";
import ukUA from "antd/locale/uk_UA";
import LoginPage from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import AppointmentsPage from "./pages/Appointments";
import { ServicesPage } from "./pages/Services";
import { MastersPage } from "./pages/Masters";
import type { NavParams } from "./api/types";

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState("1");

  const [navParams, setNavParams] = useState<NavParams | null>(null);

  const navigateTo = (tabKey: string, params?: NavParams) => {
    setNavParams(params || null);
    setActiveTab(tabKey);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("1");
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
          onLogout={handleLogout}
          activeKey={activeTab}
          onMenuClick={(key) => {
            setActiveTab(key);
            setNavParams(null);
          }}
        >
          {activeTab === "1" && <AppointmentsPage onNavigate={navigateTo} />}

          {activeTab === "2" && (
            <MastersPage
              initialId={navParams?.type === "master" ? navParams.id : null}
              onHandled={() => setNavParams(null)}
            />
          )}

          {activeTab === "3" && (
            <ServicesPage
              initialId={navParams?.type === "service" ? navParams.id : null}
              onHandled={() => setNavParams(null)}
            />
          )}
        </MainLayout>
      )}
    </ConfigProvider>
  );
};

export default App;

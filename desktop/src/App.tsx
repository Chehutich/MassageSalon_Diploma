import React, { useState } from "react";
import { ConfigProvider, Divider } from "antd";
import ukUA from "antd/locale/uk_UA";
import LoginPage from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import AppointmentsPage from "./pages/Appointments";
import { ServicesPage } from "./pages/Services";
import { MastersPage } from "./pages/Masters";
import { ClientsPage } from "./pages/Clients";
import { CategoriesPage } from "./pages/Categories";
import { SchedulePage } from "./pages/Schedule";

import { TAB_KEYS, type NavParams } from "./api/types";

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [activeTab, setActiveTab] = useState("1");
  const [navParams, setNavParams] = useState<NavParams | null>(null);

  const navigateTo = (tabKey: string, params?: NavParams) => {
    setNavParams(params || null);
    setActiveTab(tabKey);
  };

  const handleMenuChange = (key: string) => {
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
          {activeTab === TAB_KEYS.appointments && (
            <AppointmentsPage
              onNavigate={navigateTo}
              initialId={
                navParams?.type === "appointment" ? navParams.id : null
              }
              onHandled={() => setNavParams(null)}
            />
          )}
          {activeTab === TAB_KEYS.schedule && <SchedulePage />}

          {activeTab === TAB_KEYS.clients && (
            <ClientsPage
              initialId={navParams?.type === "client" ? navParams.id : null}
              onHandled={() => setNavParams(null)}
              onNavigate={navigateTo}
            />
          )}

          <Divider style={{ margin: "8px 0" }} />

          {activeTab === TAB_KEYS.masters && (
            <MastersPage
              initialId={navParams?.type === "master" ? navParams.id : null}
              onHandled={() => setNavParams(null)}
            />
          )}

          {activeTab === TAB_KEYS.services && (
            <ServicesPage
              initialId={navParams?.type === "service" ? navParams.id : null}
              onHandled={() => setNavParams(null)}
            />
          )}

          {activeTab === TAB_KEYS.categories && (
            <CategoriesPage onNavigate={navigateTo} />
          )}
        </MainLayout>
      )}
    </ConfigProvider>
  );
};

export default App;

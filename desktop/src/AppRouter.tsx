import React from "react";
import AppointmentsPage from "./pages/Appointments";
import { ServicesPage } from "./pages/Services";
import { MastersPage } from "./pages/Masters";
import { ClientsPage } from "./pages/Clients";
import { CategoriesPage } from "./pages/Categories";
import { SchedulePage } from "./pages/Schedule";
import { AnalyticsPage } from "./pages/Analytics";
import { TAB_KEYS, type NavParams } from "./api/types";

interface Props {
  activeTab: string;
  navParams: NavParams | null;
  onNavigate: (tabKey: string, params?: NavParams) => void;
  onHandled: () => void;
}

export const AppRouter: React.FC<Props> = ({
  activeTab,
  navParams,
  onNavigate,
  onHandled,
}) => {
  switch (activeTab) {
    case TAB_KEYS.appointments:
      return (
        <AppointmentsPage
          onNavigate={onNavigate}
          initialId={navParams?.type === "appointment" ? navParams.id : null}
          onHandled={onHandled}
        />
      );
    case TAB_KEYS.schedule:
      return <SchedulePage />;
    case TAB_KEYS.clients:
      return (
        <ClientsPage
          initialId={navParams?.type === "client" ? navParams.id : null}
          onHandled={onHandled}
          onNavigate={onNavigate}
        />
      );
    case TAB_KEYS.masters:
      return (
        <MastersPage
          initialId={navParams?.type === "master" ? navParams.id : null}
          onHandled={onHandled}
        />
      );
    case TAB_KEYS.services:
      return (
        <ServicesPage
          initialId={navParams?.type === "service" ? navParams.id : null}
          onHandled={onHandled}
        />
      );
    case TAB_KEYS.categories:
      return <CategoriesPage onNavigate={onNavigate} />;
    case TAB_KEYS.analytics:
      return <AnalyticsPage />;
    default:
      return null;
  }
};

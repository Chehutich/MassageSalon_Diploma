import React from "react";
import { Card, Select, Tabs, Space, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { PageHeader } from "../../../src/components/shared/PageHeader";
import { useSchedule } from "./hooks/useSchedule";
import { ScheduleTab } from "./ScheduleTab";
import { TimeOffTab } from "./TimeOffTab";

export const SchedulePage: React.FC = () => {
  const {
    masters,
    selectedMasterId,
    timeOffs,
    handleMasterChange,
    getScheduleForDay,
    handleToggleDay,
    handleTimeChange,
    handleAddTimeOff,
    handleDeleteTimeOff,
  } = useSchedule();

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{ boxShadow: "none", border: "none" }}
        styles={{ body: { padding: "12px 24px" } }}
      >
        <PageHeader
          title="Розклад"
          icon={<CalendarOutlined />}
          extra={
            <Select
              placeholder="Оберіть майстра"
              style={{ width: 240 }}
              value={selectedMasterId}
              onChange={handleMasterChange}
              options={masters.map((m) => ({
                label: `${m.users.first_name} ${m.users.last_name}`,
                value: m.id,
              }))}
              suffixIcon={<UserOutlined />}
            />
          }
        />

        {!selectedMasterId ? (
          <div
            style={{ textAlign: "center", padding: "60px 0", color: "#bfbfbf" }}
          >
            <CalendarOutlined style={{ fontSize: 48, marginBottom: 12 }} />
            <div>Оберіть майстра для перегляду розкладу</div>
          </div>
        ) : (
          <Tabs
            defaultActiveKey="schedule"
            items={[
              {
                key: "schedule",
                label: (
                  <Space>
                    <ClockCircleOutlined />
                    Робочий графік
                  </Space>
                ),
                children: (
                  <ScheduleTab
                    getScheduleForDay={getScheduleForDay}
                    onToggle={handleToggleDay}
                    onTimeChange={handleTimeChange}
                  />
                ),
              },
              {
                key: "timeoffs",
                label: (
                  <Space>
                    <CalendarOutlined />
                    Відгули
                    {timeOffs.length > 0 && (
                      <Tag color="volcano" style={{ margin: 0 }}>
                        {timeOffs.length}
                      </Tag>
                    )}
                  </Space>
                ),
                children: (
                  <TimeOffTab
                    timeOffs={timeOffs}
                    onAdd={handleAddTimeOff}
                    onDelete={handleDeleteTimeOff}
                  />
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

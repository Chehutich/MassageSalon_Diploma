import {
  Card,
  Col,
  Row,
  Space,
  Switch,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import { Schedule } from "../../api/types";
import { ACCENT, DAY_LABELS, DAY_ORDER } from "./constants";

const { Text } = Typography;

interface Props {
  getScheduleForDay: (day: number) => Schedule | undefined;
  onToggle: (day: number, enabled: boolean) => void;
  onTimeChange: (day: number, start: string, end: string) => void;
}

export const ScheduleTab: React.FC<Props> = ({
  getScheduleForDay,
  onToggle,
  onTimeChange,
}) => (
  <div style={{ maxWidth: 600 }}>
    <Space orientation="vertical" style={{ width: "100%" }} size={12}>
      {DAY_ORDER.map((day) => {
        const s = getScheduleForDay(day);
        const isActive = !!s;
        return (
          <Card
            key={day}
            size="small"
            style={{
              borderRadius: 8,
              borderColor: isActive ? "#b7eb8f" : "#f0f0f0",
              backgroundColor: isActive ? "#f6ffed" : "#fafafa",
            }}
          >
            <Row align="middle" gutter={16}>
              <Col span={1}>
                <Switch
                  checked={isActive}
                  onChange={(v) => onToggle(day, v)}
                  size="small"
                  style={{ backgroundColor: isActive ? ACCENT : undefined }}
                />
              </Col>
              <Col span={5}>
                <Text
                  strong={isActive}
                  type={isActive ? undefined : "secondary"}
                  style={{ marginLeft: 8 }}
                >
                  {DAY_LABELS[day]}
                </Text>
              </Col>
              <Col span={14}>
                {isActive ? (
                  <Space>
                    <TimePicker
                      value={dayjs(s!.start_time, "HH:mm")}
                      format="HH:mm"
                      minuteStep={15}
                      size="small"
                      allowClear={false}
                      onChange={(t) => {
                        if (t)
                          onTimeChange(day, t.format("HH:mm"), s!.end_time);
                      }}
                    />
                    <Text type="secondary">—</Text>
                    <TimePicker
                      value={dayjs(s!.end_time, "HH:mm")}
                      format="HH:mm"
                      minuteStep={15}
                      size="small"
                      allowClear={false}
                      onChange={(t) => {
                        if (t)
                          onTimeChange(day, s!.start_time, t.format("HH:mm"));
                      }}
                    />
                  </Space>
                ) : (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Вихідний
                  </Text>
                )}
              </Col>
              <Col span={4} style={{ textAlign: "right" }}>
                {isActive && (
                  <Tag color="green" style={{ margin: 0 }}>
                    {s!.start_time} – {s!.end_time}
                  </Tag>
                )}
              </Col>
            </Row>
          </Card>
        );
      })}
    </Space>
  </div>
);

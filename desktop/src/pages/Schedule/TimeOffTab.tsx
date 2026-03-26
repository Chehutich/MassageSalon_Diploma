import React, { useState } from "react";
import {
  Row,
  Col,
  Calendar,
  Badge,
  Space,
  Button,
  Card,
  Popconfirm,
  Typography,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { TimeOff } from "../../api/types";
import { AddTimeOffModal } from "./AddTimeOffModal";
import { ACCENT } from "./constants";

dayjs.extend(isBetween);

const { Text, Title: AntTitle } = Typography;

interface Props {
  timeOffs: TimeOff[];
  onAdd: (range: [Dayjs, Dayjs], reason: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}

export const TimeOffTab: React.FC<Props> = ({ timeOffs, onAdd, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getTimeOffForDate = (date: Dayjs) =>
    timeOffs.find((t) => date.isBetween(t.start_date, t.end_date, "day", "[]"));

  return (
    <>
      <Row gutter={24}>
        <Col span={14}>
          <Calendar
            fullscreen={false}
            cellRender={(date) => {
              const off = getTimeOffForDate(date);
              if (!off) return null;
              return (
                <div
                  style={{
                    position: "absolute",
                    bottom: 2,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <Badge color="volcano" />
                </div>
              );
            }}
          />
        </Col>

        <Col span={10}>
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <AntTitle level={5} style={{ margin: 0, fontSize: 14 }}>
              Список відгулів
            </AntTitle>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
            >
              Додати
            </Button>
          </Space>

          <Space orientation="vertical" style={{ width: "100%" }} size={8}>
            {timeOffs.length === 0 && (
              <Text type="secondary">Відгулів немає</Text>
            )}
            {timeOffs.map((t) => (
              <Card
                key={t.id}
                size="small"
                style={{ borderRadius: 8, borderColor: "#ffbb96" }}
              >
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space orientation="vertical" size={0}>
                      <Text strong style={{ color: "#d4380d" }}>
                        {dayjs(t.start_date).format("DD.MM.YYYY")}
                        {t.start_date !== t.end_date &&
                          ` — ${dayjs(t.end_date).format("DD.MM.YYYY")}`}
                      </Text>
                      {t.reason && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {t.reason}
                        </Text>
                      )}
                    </Space>
                  </Col>
                  <Col>
                    <Popconfirm
                      title="Видалити відгул?"
                      onConfirm={() => onDelete(t.id)}
                      okText="Так"
                      cancelText="Ні"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Col>
      </Row>

      <AddTimeOffModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={async (range, reason) => {
          const ok = await onAdd(range, reason);
          if (ok) setModalVisible(false);
          return ok;
        }}
      />
    </>
  );
};

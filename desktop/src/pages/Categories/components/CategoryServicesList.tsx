import React from "react";
import { Button, Divider, List } from "antd";
import { ArrowRightOutlined, ScissorOutlined } from "@ant-design/icons";
import { NavigateFn, Service, TAB_KEYS } from "../../../api/types";

interface Props {
  services: Service[];
  loading: boolean;
  onNavigate: NavigateFn;
  onClose: () => void;
}

export const CategoryServicesList: React.FC<Props> = ({
  services,
  loading,
  onNavigate,
  onClose,
}) => (
  <>
    <Divider plain>
      <ScissorOutlined /> Послуги в цій категорії
    </Divider>
    <List
      loading={loading}
      size="small"
      bordered
      dataSource={services}
      locale={{ emptyText: "У цій категорії ще немає послуг" }}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              type="link"
              icon={<ArrowRightOutlined />}
              onClick={() => {
                onNavigate(TAB_KEYS.services, { id: item.id, type: "service" });
                onClose();
              }}
            >
              Перейти
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={item.title}
            description={`${item.price} грн · ${item.duration} хв`}
          />
        </List.Item>
      )}
      style={{ maxHeight: 200, overflowY: "auto", borderRadius: 8 }}
    />
  </>
);

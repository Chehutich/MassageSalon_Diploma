import React from "react";
import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  DollarCircleOutlined,
  ScissorOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { DRAWER_ACCENT } from "../../../../src/components/shared/drawerStyles";

const { Title } = Typography;

const statCardStyle: React.CSSProperties = {
  borderRadius: 8,
  textAlign: "center",
  height: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

interface Props {
  visitCount: number;
  totalSpent: number;
  favoriteService: string;
}

export const ClientStats: React.FC<Props> = ({
  visitCount,
  totalSpent,
  favoriteService,
}) => (
  <>
    <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>
      Статистика
    </Title>
    <Row gutter={16} style={{ marginBottom: 8 }}>
      <Col span={8}>
        <Card size="small" style={statCardStyle}>
          <Statistic
            title="Завершених візитів"
            value={visitCount}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: DRAWER_ACCENT }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small" style={statCardStyle}>
          <Statistic
            title="Витрачено"
            value={totalSpent}
            suffix="₴"
            prefix={<DollarCircleOutlined />}
            valueStyle={{ color: DRAWER_ACCENT }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small" style={statCardStyle}>
          <Statistic
            title="Улюблена послуга"
            value={favoriteService}
            valueStyle={{ fontSize: 13, color: DRAWER_ACCENT }}
          />
        </Card>
      </Col>
    </Row>
  </>
);

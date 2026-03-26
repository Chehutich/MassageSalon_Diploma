import React from "react";
import { Button, Space } from "antd";
import { FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import { AnalyticsRow } from "../utils/aggregations";
import { exportToCSV, exportToExcel } from "../utils/exportData";

interface Props {
  rows: AnalyticsRow[];
  filename?: string;
}

export const ExportToolbar: React.FC<Props> = ({
  rows,
  filename = "analytics",
}) => (
  <Space>
    <Button
      icon={<FileTextOutlined />}
      onClick={() => exportToCSV(rows, filename)}
    >
      CSV
    </Button>
    <Button
      icon={<FileExcelOutlined />}
      style={{ color: "#217346", borderColor: "#217346" }}
      onClick={() => exportToExcel(rows, filename)}
    >
      Excel
    </Button>
  </Space>
);

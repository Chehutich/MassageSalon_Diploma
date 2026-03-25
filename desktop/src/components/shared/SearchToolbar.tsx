import React from "react";
import { Space, Input, Button } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";

interface SearchToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  children?: React.ReactNode;
  showClear?: boolean;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchValue,
  onSearchChange,
  onClear,
  placeholder = "Пошук...",
  children,
  showClear,
}) => (
  <div style={{ marginBottom: 20 }}>
    <Space wrap size="middle">
      <Input
        placeholder={placeholder}
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 280 }}
        allowClear
      />
      {children}
      {showClear && (
        <Button type="link" danger icon={<ClearOutlined />} onClick={onClear}>
          Очистити
        </Button>
      )}
    </Space>
  </div>
);

import React, { useState, useEffect } from 'react';
import { Table, Select, Typography, Card, Tag, message, Space } from 'antd';
import { CodeSandboxOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load danh sách sản phẩm để đưa vào ô tìm kiếm
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/products');
      setProducts(res.data);
    } catch (error) {
      message.error("Lỗi tải danh sách sản phẩm");
    }
  };

  // Khi chủ shop chọn 1 sản phẩm -> Gọi API lấy Thẻ kho
  const handleProductSelect = async (productId) => {
    setSelectedProductId(productId);
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/v1/stock-cards/product/${productId}`);
      setStockHistory(res.data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu thẻ kho");
    } finally {
      setLoading(false);
    }
  };

  // Cột hiển thị bảng Thẻ kho
  const columns = [
    { 
      title: 'Thời gian', 
      dataIndex: 'createdAt', 
      render: date => new Date(date).toLocaleString('vi-VN') 
    },
    { 
      title: 'Mã tham chiếu', 
      dataIndex: 'referenceCode', 
      render: text => <Text strong type="secondary">{text}</Text> 
    }, // VD: HD17098233 (Mã hóa đơn)
    { 
      title: 'Loại giao dịch', 
      dataIndex: 'changeType', 
      render: type => {
        let color = 'default';
        let label = type;
        if (type === 'SELL') { color = 'red'; label = 'Bán hàng (Xuất)'; }
        if (type === 'IMPORT') { color = 'green'; label = 'Nhập hàng'; }
        if (type === 'INIT') { color = 'blue'; label = 'Khởi tạo'; }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    { 
      title: 'Biến động', 
      dataIndex: 'quantityChange', 
      align: 'right',
      render: val => (
        <span style={{ color: val > 0 ? '#52c41a' : '#cf1322', fontWeight: 'bold', fontSize: '16px' }}>
          {val > 0 ? `+${val}` : val}
        </span>
      )
    },
    { 
      title: 'Tồn cuối', 
      dataIndex: 'balanceQuantity', 
      align: 'right',
      render: val => <Text strong>{val}</Text> 
    },
    { 
      title: 'Ghi chú', 
      dataIndex: 'note' 
    }
  ];

  return (
    <div style={{ padding: '24px', minHeight: '80vh' }}>
      <Title level={3} style={{ marginBottom: '24px' }}>
        <CodeSandboxOutlined /> Thẻ Kho (Lịch sử biến động)
      </Title>

      <Card style={{ marginBottom: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Space style={{ width: '100%' }} direction="vertical">
          <Text strong>Chọn mặt hàng cần xem lịch sử:</Text>
          <Select
            showSearch
            style={{ width: '100%', maxWidth: '500px' }}
            placeholder="Gõ mã SKU hoặc tên sản phẩm..."
            optionFilterProp="children"
            onChange={handleProductSelect}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            size="large"
          >
            {products.map(p => (
              <Option key={p.id} value={p.id}>
                <Text strong>[{p.sku}]</Text> - {p.productName} (Đang tồn: {p.stockQuantity})
              </Option>
            ))}
          </Select>
        </Space>
      </Card>

      {selectedProductId && (
        <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Table 
            columns={columns} 
            dataSource={stockHistory} 
            rowKey="id" 
            loading={loading}
            bordered
            pagination={{ pageSize: 15 }}
          />
        </Card>
      )}
    </div>
  );
};

export default Inventory;
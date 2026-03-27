import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message, Space, Button, DatePicker } from 'antd';
import { EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/orders');
      setOrders(res.data);
    } catch (error) {
      message.error("Lỗi khi tải lịch sử hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  // Render phần chi tiết khi bấm mở rộng 1 hàng (Expandable Row)
  const expandedRowRender = (record) => {
    const detailColumns = [
      { title: 'Mã hàng', dataIndex: ['product', 'sku'], key: 'sku' },
      { title: 'Tên hàng hóa', dataIndex: ['product', 'productName'], key: 'productName' },
      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
      { title: 'Đơn giá', dataIndex: 'unitPrice', render: val => val.toLocaleString('vi-VN') + ' đ' },
      { title: 'Thành tiền', dataIndex: 'totalPrice', render: val => val.toLocaleString('vi-VN') + ' đ' },
    ];

    return (
      <div style={{ padding: '10px 20px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
        <Text strong>Chi tiết mặt hàng:</Text>
        <Table 
          columns={detailColumns} 
          dataSource={record.orderDetails} 
          pagination={false} 
          rowKey="id"
          size="small"
          style={{ marginTop: '10px' }}
        />
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
            <Text>Tiền khách đưa: <strong>{record.customerTendered.toLocaleString('vi-VN')} đ</strong></Text>
            <Text>Tiền thối lại: <strong>{record.changeAmount.toLocaleString('vi-VN')} đ</strong></Text>
        </div>
      </div>
    );
  };

  // Cột cho bảng chính
  const columns = [
    { 
      title: 'Mã Hóa Đơn', 
      dataIndex: 'orderCode', 
      key: 'orderCode', 
      render: text => <Text strong style={{ color: '#1890ff' }}>{text}</Text> 
    },
    { 
      title: 'Thời gian bán', 
      dataIndex: 'createdAt', 
      render: date => new Date(date).toLocaleString('vi-VN') 
    },
    { 
      title: 'Nhân viên', 
      dataIndex: ['createdBy', 'fullName'], // Giả sử entity User có field fullName
      render: (text, record) => text || record.createdBy?.username || 'Thu ngân'
    },
    { 
      title: 'Khách phải trả', 
      dataIndex: 'finalAmount', 
      render: val => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{val.toLocaleString('vi-VN')} đ</span>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: status => <Tag color={status === 'COMPLETED' ? 'green' : 'red'}>{status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}</Tag> 
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<PrinterOutlined />} title="In lại hóa đơn" />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Lịch sử Hóa đơn</Title>
        <RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
      </div>

      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="id" 
        loading={loading}
        bordered
        expandable={{ expandedRowRender }} // Kích hoạt tính năng bấm xổ xuống xem chi tiết
      />
    </div>
  );
};

export default Orders;
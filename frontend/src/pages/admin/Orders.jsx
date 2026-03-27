import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, message, Space, Button, DatePicker, Select } from 'antd';
import { EyeOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons';
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
      console.log('[Orders] res.data =', res.data);
      const orderList = Array.isArray(res.data)
        ? res.data
        : (res.data?.content || []);
      setOrders(orderList);
    } catch (error) {
      message.error("Lỗi khi tải lịch sử hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Note: This would need a backend API endpoint like PUT /api/v1/orders/{id}/status
      // await axiosInstance.put(`/api/v1/orders/${orderId}/status`, { status: newStatus });
      message.success(`Cập nhật trạng thái thành công: ${newStatus}`);
      // For now, just update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Render phần chi tiết khi bấm mở rộng 1 hàng (Expandable Row)
  const expandedRowRender = (record) => {
    const detailColumns = [
      { title: 'Mã hàng', dataIndex: 'productSku', key: 'productSku' },
      { title: 'Tên hàng hóa', dataIndex: 'productName', key: 'productName' },
      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
      { title: 'Đơn giá', dataIndex: 'unitPrice', render: val => val.toLocaleString('vi-VN') + ' đ' },
      { title: 'Thành tiền', dataIndex: 'totalPrice', render: val => val.toLocaleString('vi-VN') + ' đ' },
    ];

    return (
      <div style={{ padding: '10px 20px', backgroundColor: '#fafafa', borderRadius: '8px' }}>
        <Text strong>Chi tiết mặt hàng:</Text>
        <Table 
          columns={detailColumns} 
          dataSource={Array.isArray(record.orderDetails) ? record.orderDetails : []} 
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
      dataIndex: 'createdByName', // Sử dụng trường từ DTO
      render: (text) => text || 'Thu ngân'
    },
    { 
      title: 'Khách phải trả', 
      dataIndex: 'finalAmount', 
      render: val => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{val.toLocaleString('vi-VN')} đ</span>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
          <Select.Option value="PENDING">Đang xử lý</Select.Option>
          <Select.Option value="CANCELLED">Đã hủy</Select.Option>
        </Select>
      )
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
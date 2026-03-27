import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Table, Typography, Tag, Select, Button,
  Progress, Avatar, Space, Divider, message
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DollarOutlined, ShoppingCartOutlined, AlertOutlined, ArrowUpOutlined,
  ArrowDownOutlined, BarChartOutlined, PieChartOutlined, PlusOutlined,
  ShoppingOutlined, UserOutlined, ExportOutlined, ReloadOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = ({ storeId }) => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('today');
  const [activeStoreId, setActiveStoreId] = useState(storeId || null);

  const exportReport = () => {
    try {
      const content = JSON.stringify({
        ...data,
        chartData: data.chartData || { labels: [], data: [] },
        recentOrders: data.recentOrders || []
      }, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Xuất báo cáo dashboard thành công.');
    } catch (error) {
      console.error(error);
      message.error('Xuất báo cáo thất bại.');
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const query = activeStoreId ? `?storeId=${activeStoreId}` : '';
      const ordersRes = await axiosInstance.get(`/api/v1/orders${query}`);
      const orders = ordersRes.data || [];
      if (!orders.length) {
        message.warning('Không có dữ liệu đơn hàng để xuất.');
        return;
      }

      const csvHeader = ['Mã hóa đơn', 'Thời gian', 'Tổng tiền', 'Trạng thái'];
      const csvRows = [csvHeader.join(',')];
      orders.forEach((ord) => {
        const row = [
          `"${ord.orderCode || ''}"`,
          `"${new Date(ord.createdAt).toLocaleString('vi-VN')}"`,
          ord.finalAmount || 0,
          ord.status || ''
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Xuất dữ liệu đơn hàng thành công.');
    } catch (error) {
      console.error(error);
      message.error('Xuất dữ liệu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'newOrder':
        navigate('/pos');
        break;
      case 'addProduct':
        navigate('/admin/products');
        break;
      case 'inventoryCheck':
        navigate('/admin/inventory');
        break;
      case 'importExport':
        navigate('/admin/import');
        break;
      case 'exportReport':
        exportReport();
        break;
      case 'exportData':
        exportData();
        break;
      default:
        message.error('Hành động không xác định');
    }
  };
  const [data, setData] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    lowStockWarning: 0,
    recentOrders: [],
    chartData: { labels: [], data: [] },
    topProducts: [],
    comparison: {
      currentRevenue: 0,
      previousRevenue: 0,
      currentOrders: 0,
      previousOrders: 0,
      revenueChangePercent: 0,
      ordersChangePercent: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeStoreId) {
      const urlParams = new URLSearchParams(window.location.search);
      const sid = urlParams.get('storeId');
      if (sid) {
        setActiveStoreId(parseInt(sid, 10));
      }
    }
    fetchDashboardData();
  }, [timeFilter, activeStoreId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const query = activeStoreId ? `?storeId=${activeStoreId}` : '';
      const [dashboardRes, chartRes, topProductsRes, comparisonRes] = await Promise.all([
        axiosInstance.get(`/api/v1/reports/dashboard${query}`),
        axiosInstance.get(`/api/v1/reports/dashboard/chart${query}`),
        axiosInstance.get(`/api/v1/reports/dashboard/top-products${query}`),
        axiosInstance.get(`/api/v1/reports/dashboard/comparison${query}`)
      ]);

      setData({
        ...dashboardRes.data,
        chartData: chartRes.data,
        topProducts: topProductsRes.data,
        comparison: comparisonRes.data
      });
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  // Cột cho bảng 5 đơn hàng gần nhất
  const columns = [
    { title: 'Mã Hóa Đơn', dataIndex: 'orderCode', key: 'orderCode', render: text => <Text strong>{text}</Text> },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: amount => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{amount.toLocaleString('vi-VN')} đ</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: status => <Tag color={status === 'COMPLETED' ? 'green' : 'red'}>{status}</Tag>
    }
  ];

  // Dữ liệu cho biểu đồ
  const chartData = data.chartData.labels.map((label, index) => ({
    date: label,
    revenue: data.chartData.data[index] || 0
  }));

  // Màu sắc cho biểu đồ tròn
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div style={{ padding: '24px' }}>
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Kết Quả Bán Hàng</Title>
        </Col>
        <Col>
          <Space>
            <Select value={timeFilter} onChange={setTimeFilter} style={{ width: 120 }}>
              <Option value="today">Hôm nay</Option>
              <Option value="week">Tuần này</Option>
              <Option value="month">Tháng này</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchDashboardData}>
              Làm mới
            </Button>
          </Space>
        </Col>
      </Row>

      {/* QUICK ACTIONS */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Quick Actions" size="small">
            <Space wrap>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleQuickAction('newOrder')}>
                Tạo đơn hàng
              </Button>
              <Button icon={<ShoppingOutlined />} onClick={() => handleQuickAction('addProduct')}>
                Thêm sản phẩm
              </Button>
              <Button icon={<AlertOutlined />} onClick={() => handleQuickAction('inventoryCheck')}>
                Kiểm kho
              </Button>
              <Button icon={<ArrowUpOutlined />} onClick={() => handleQuickAction('importExport')}>
                Nhập kho
              </Button>
              <Button icon={<BarChartOutlined />} onClick={() => handleQuickAction('exportReport')}>
                Xuất báo cáo
              </Button>
              <Button icon={<ExportOutlined />} onClick={() => handleQuickAction('exportData')}>
                Xuất dữ liệu
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* HÀNG 1: CÁC THẺ SỐ LIỆU TỔNG QUAN */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Doanh thu"
              value={data.todayRevenue}
              precision={0}
              styles={{ content: { color: '#3f8600', fontWeight: 'bold' } }}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: data.comparison.revenueChangePercent >= 0 ? '#3f8600' : '#cf1322' }}>
              {data.comparison.revenueChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(data.comparison.revenueChangePercent).toFixed(1)}% so với tuần trước
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Số hóa đơn"
              value={data.todayOrders}
              styles={{ content: { color: '#1890ff', fontWeight: 'bold' } }}
              prefix={<ShoppingCartOutlined />}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: data.comparison.ordersChangePercent >= 0 ? '#3f8600' : '#cf1322' }}>
              {data.comparison.ordersChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(data.comparison.ordersChangePercent).toFixed(1)}% so với tuần trước
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: data.lowStockWarning > 0 ? '#fff1f0' : '#fff' }}>
            <Statistic
              title="Hàng sắp hết"
              value={data.lowStockWarning}
              styles={{ content: { color: '#cf1322', fontWeight: 'bold' } }}
              prefix={<AlertOutlined />}
              suffix="sản phẩm"
            />
            {data.lowStockWarning > 0 && (
              <Progress
                percent={Math.min((data.lowStockWarning / 10) * 100, 100)}
                showInfo={false}
                strokeColor="#cf1322"
                size="small"
                style={{ marginTop: '8px' }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card loading={loading} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Trung bình/đơn"
              value={data.todayOrders > 0 ? data.todayRevenue / data.todayOrders : 0}
              precision={0}
              styles={{ content: { color: '#722ed1', fontWeight: 'bold' } }}
              prefix={<BarChartOutlined />}
              suffix="VNĐ"
            />
          </Card>
        </Col>
      </Row>

      {/* HÀNG 2: BIỂU ĐỒ DOANH THU */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 7 ngày qua" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                  labelStyle={{ color: '#000' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3f8600"
                  strokeWidth={3}
                  dot={{ fill: '#3f8600', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Top 5 sản phẩm bán chạy" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Space orientation="vertical" style={{ width: '100%' }}>
              {data.topProducts.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                  <Avatar style={{ backgroundColor: COLORS[index % COLORS.length], marginRight: '12px' }}>
                    {index + 1}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Đã bán: {item.totalSold} sản phẩm
                    </Text>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* HÀNG 3: GIAO DỊCH GẦN NHẤT */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Giao dịch mới nhất" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Table
              loading={loading}
              dataSource={data.recentOrders}
              columns={columns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Button, Table, Tag, Space, message } from 'antd';
import { UserOutlined, ShopOutlined, LineChartOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [lowStockWarning, setLowStockWarning] = useState(0);
  const [usersList, setUsersList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchStores();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/v1/reports/dashboard');
      const data = res.data;
      setTodayRevenue(data.todayRevenue || 0);
      setTodayOrders(data.todayOrders || 0);
      setLowStockWarning(data.lowStockWarning || 0);
    } catch (error) {
      console.error('Unable to load dashboard stats', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/admin/users');
      setUsersList(res.data || []);
      setTotalUsers((res.data || []).length);
    } catch (error) {
      console.error('Unable to load users', error);
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get('/api/v1/stores');
      setTotalStores((res.data || []).length);
      setStoreList(res.data || []);
    } catch (error) {
      console.error('Unable to load stores', error);
      setTotalStores(0);
      setStoreList([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        await api.delete(`/api/v1/admin/users/${userId}`);
        alert('Xóa user thành công!');
        fetchUsers();
      } catch (error) {
        alert('Lỗi khi xóa user: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleViewStore = (storeId) => {
    navigate(`/admin/store-detail/${storeId}`);
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này?')) {
      try {
        await api.delete(`/api/v1/stores/${storeId}`);
        message.success('Xóa cửa hàng thành công');
        fetchStores();
      } catch (error) {
        message.error('Lỗi khi xóa cửa hàng: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <LineChartOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Quản lý User',
    },
    {
      key: 'stores',
      icon: <ShopOutlined />,
      label: 'Quản lý Store',
    },
    {
      key: 'analytics',
      icon: <LineChartOutlined />,
      label: 'Thống kê Hệ thống',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cấu hình',
    },
  ];

  // Tạo thành phần Dashboard tổng quát
  const renderDashboard = () => (
    <div>
      <h2>Admin Dashboard - Quản lý Hệ thống</h2>
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng User"
              value={totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Store"
              value={totalStores}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Doanh thu"
              value={todayRevenue}
              suffix="đ"
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={todayOrders}
              styles={{ content: { color: '#f5222d' } }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card>
            <Statistic
              title="Cảnh báo tồn kho thấp"
              value={lowStockWarning}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Tạo thành phần Quản lý User
  const renderUsers = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Quản lý User (Chủ cửa hàng)</h2>
        <Button type="primary" onClick={fetchUsers}>Tải lại</Button>
      </div>
      <Table
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'Tên User', dataIndex: 'fullName' },
          { title: 'Username', dataIndex: 'username' },
          { title: 'Store ID', dataIndex: 'storeId', render: (storeId) => storeId || 'Chưa có' },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status) => (
              <Tag color={status === 'active' ? 'green' : 'red'}>
                {status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
              </Tag>
            ),
          },
          {
            title: 'Thao tác',
            render: (_, record) => (
              <Space>
                <Button type="primary" size="small" onClick={() => navigate(`/admin/user-detail/${record.id}`)}>
                  Chi tiết
                </Button>
                <Button type="default" size="small" onClick={() => navigate(`/admin/super-dashboard/impersonate/${record.id}`)}>
                  Impersonate
                </Button>
                <Button type="primary" danger size="small" onClick={() => handleDeleteUser(record.id)}>
                  Xóa
                </Button>
              </Space>
            ),
          },
        ]}
        dataSource={usersList}
        loading={loading}
        rowKey="id"
      />
    </div>
  );

  // Tạo thành phần Quản lý Store
  const renderStores = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Quản lý Store</h2>
        <Button type="primary" onClick={fetchStores}>Tải lại</Button>
      </div>
      <Table
        columns={[
          { title: 'ID', dataIndex: 'id', width: 60 },
          { title: 'Tên Store', dataIndex: 'name' },
          { title: 'Chủ sở hữu', dataIndex: 'sellerName' },
          { title: 'Địa chỉ', dataIndex: 'address' },
          {
            title: 'Thao tác',
            render: (_, record) => (
              <Space>
                <Button type="link" size="small" onClick={() => handleViewStore(record.id)}>
                  Xem chi tiết
                </Button>
                <Button type="text" danger size="small" onClick={() => handleDeleteStore(record.id)}>
                  Xóa
                </Button>
              </Space>
            ),
          },
        ]}
        dataSource={storeList}
        loading={loading}
        rowKey="id"
      />
    </div>
  );

  // Render content dựa trên menu được chọn
  const renderContent = () => {
    switch (selectedMenu) {
      case 'users':
        return renderUsers();
      case 'stores':
        return renderStores();
      case 'analytics':
        return <div><h2>Thống kê Hệ thống (Sắp cập nhật)</h2></div>;
      case 'settings':
        return <div><h2>Cấu hình (Sắp cập nhật)</h2></div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div style={{ color: 'white', padding: '16px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          {collapsed ? 'Admin' : 'Admin Panel'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={(e) => setSelectedMenu(e.key)}
        />
        <div style={{ padding: '16px', marginTop: 'auto' }}>
          <Button
            type="primary"
            danger
            block
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px' }}
          >
            {collapsed ? '☰' : '☰'}
          </Button>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Đăng nhập: <strong>Admin</strong>
          </div>
        </Header>

        <Content style={{ margin: '24px', padding: '24px', background: '#fff', borderRadius: '8px' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;

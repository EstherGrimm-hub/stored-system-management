import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Dropdown, Space, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BarcodeOutlined,
  ProfileOutlined,
  CodeSandboxOutlined,
  LogoutOutlined,
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  ImportOutlined
} from '@ant-design/icons';
import axiosInstance from '../api/axios';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [storeName, setStoreName] = useState('KiotViet Pro');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axiosInstance.get('/api/v1/users/me');
        if (res.data.storeName) {
          setStoreName(res.data.storeName);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Cấu hình các mục trong Menu bên trái
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/admin/products',
      icon: <BarcodeOutlined />,
      label: 'Hàng hóa',
    },
    {
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: 'Danh mục',
    },
    {
      key: '/admin/import',
      icon: <ImportOutlined />,
      label: 'Nhập kho',
    },
    {
      key: '/admin/orders',
      icon: <ProfileOutlined />,
      label: 'Giao dịch (Hóa đơn)',
    },
    {
      key: '/admin/inventory',
      icon: <CodeSandboxOutlined />,
      label: 'Kiểm kho (Thẻ kho)',
    },
  ];

  const userMenu = {
    items: [
      {
        key: '1',
        icon: <ShopOutlined />,
        label: 'Đến màn hình Thu Ngân (POS)',
        onClick: () => navigate('/pos'),
      },
      {
        type: 'divider',
      },
      {
        key: '2',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* CỘT BÊN TRÁI: SIDEBAR */}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        style={{ position: 'sticky', top: 0, left: 0, height: '100vh' }}
      >
        <div style={{ height: '64px', margin: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title level={collapsed ? 4 : 3} style={{ color: '#fff', margin: 0, transition: 'all 0.3s' }}>
            {collapsed ? storeName.substring(0, 2).toUpperCase() : storeName}
          </Title>
        </div>
        
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* KHU VỰC BÊN PHẢI */}
      <Layout className="site-layout">
        {/* THANH HEADER */}
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)', zIndex: 1 }}>
          <Dropdown menu={userMenu} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Text strong>Quản lý Cửa hàng</Text>
            </Space>
          </Dropdown>
        </Header>

        {/* KHU VỰC HIỂN THỊ NỘI DUNG CHÍNH (Render các trang Dashboard, Products...) */}
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
          {/* <Outlet /> chính là nơi React Router sẽ "bơm" các Component con vào */}
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
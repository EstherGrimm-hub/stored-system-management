import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      const res = await api.get(`/api/v1/admin/users/${id}`);
      setUser(res.data);
    } catch (error) {
      console.error('Unable to load user detail', error);
      message.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div>Không tìm thấy người dùng</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/dashboard')}
        style={{ marginBottom: '16px' }}
      >
        Quay lại
      </Button>
      <Card title="Chi tiết người dùng">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
          <Descriptions.Item label="Họ tên">{user.fullName}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">{user.role}</Descriptions.Item>
          <Descriptions.Item label="Có cửa hàng">{user.hasStore ? 'Có' : 'Không'}</Descriptions.Item>
          {user.storeId && <Descriptions.Item label="ID cửa hàng">{user.storeId}</Descriptions.Item>}
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserDetail;
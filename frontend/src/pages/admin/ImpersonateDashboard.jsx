import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import Dashboard from './Dashboard';

const ImpersonateDashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/v1/admin/users/${userId}`);
        setUser(res.data);
        if (res.data && res.data.storeId) {
          setStoreId(res.data.storeId);
        } else {
          message.error('Người dùng không có cửa hàng để impersonate.');
        }
      } catch (error) {
        console.error('Cannot load user for impersonation', error);
        message.error('Không thể tải thông tin người dùng.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div>Không tìm thấy người dùng</div>;
  }

  if (!storeId) {
    return (
      <Card style={{ margin: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/super-dashboard')} style={{ marginBottom: '16px' }}>
          Quay lại
        </Button>
        <p>Người dùng không có cửa hàng liên kết.</p>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ padding: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/super-dashboard')} style={{ marginBottom: '16px' }}>
          Quay lại SuperAdmin
        </Button>
      </div>

      <Card style={{ margin: '0 24px 24px' }}>
        <h2>Đang giả lập store của user: {user.fullName} (ID: {user.id})</h2>
        <p>Cửa hàng ID: {storeId}</p>
      </Card>

      <div style={{ margin: '0 24px' }}>
        <Dashboard storeId={storeId} />
      </div>
    </div>
  );
};

export default ImpersonateDashboard;

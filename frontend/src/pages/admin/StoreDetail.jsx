import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreDetail();
  }, [id]);

  const fetchStoreDetail = async () => {
    try {
      const res = await api.get(`/api/v1/stores/${id}`);
      setStore(res.data);
    } catch (error) {
      console.error('Unable to load store detail', error);
      message.error('Không thể tải thông tin cửa hàng');
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

  if (!store) {
    return <div>Không tìm thấy cửa hàng</div>;
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
      <Card title="Chi tiết cửa hàng">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{store.id}</Descriptions.Item>
          <Descriptions.Item label="Tên cửa hàng">{store.name}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{store.address}</Descriptions.Item>
          {store.seller && <Descriptions.Item label="Chủ cửa hàng">{store.seller.fullName}</Descriptions.Item>}
        </Descriptions>
      </Card>
    </div>
  );
};

export default StoreDetail;
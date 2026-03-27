import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Card, Row, Col, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/admin/users');
      setUsers(res.data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách user');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: 'Xóa User',
      content: 'Bạn có chắc chắn muốn xóa user này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/api/v1/admin/users/${userId}`);
          message.success('Xóa user thành công');
          fetchUsers();
        } catch (error) {
          message.error('Lỗi khi xóa user');
        }
      },
    });
  };

  const handleSaveUser = async (values) => {
    try {
      if (editingUser) {
        await api.put(`/api/v1/admin/users/${editingUser.id}`, values);
        message.success('Cập nhật user thành công');
      } else {
        await api.post('/api/v1/admin/users', values);
        message.success('Thêm user thành công');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Lỗi khi lưu user');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60, sorter: (a, b) => a.id - b.id },
    { title: 'Tên User', dataIndex: 'fullName', width: 150 },
    { title: 'Username', dataIndex: 'username', width: 120 },
    { title: 'Cửa hàng', dataIndex: 'storeName', width: 150 },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: 100,
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? 'Admin' : 'User'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
        </Tag>
      ),
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', width: 120 },
    {
      title: 'Thao tác',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {users.length}
              </div>
              <div style={{ color: '#666' }}>Tổng User</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {users.filter(u => u.status === 'active').length}
              </div>
              <div style={{ color: '#666' }}>Đang hoạt động</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {users.filter(u => u.status === 'inactive').length}
              </div>
              <div style={{ color: '#666' }}>Vô hiệu</div>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddUser}>
              Thêm User
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <h3>Danh sách User</h3>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Chỉnh sửa User' : 'Thêm User mới'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveUser}>
          <Form.Item
            label="Tên đầy đủ"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Nhập tên user" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập username' }]}
          >
            <Input placeholder="Nhập username" disabled={editingUser} />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item
            label="Cửa hàng"
            name="storeId"
            rules={[{ required: true, message: 'Vui lòng chọn cửa hàng' }]}
          >
            <Select placeholder="Chọn cửa hàng">
              <Select.Option value={1}>Store A</Select.Option>
              <Select.Option value={2}>Store B</Select.Option>
              <Select.Option value={3}>Store C</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Select.Option value="active">Hoạt động</Select.Option>
              <Select.Option value="inactive">Vô hiệu</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;

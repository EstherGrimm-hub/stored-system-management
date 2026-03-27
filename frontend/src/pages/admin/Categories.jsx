import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/categories');
      setCategories(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (values) => {
    try {
      if (editingCategory) {
        await axiosInstance.put(`/api/v1/categories/${editingCategory.id}`, values);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await axiosInstance.post('/api/v1/categories', values);
        message.success("Thêm danh mục thành công!");
      }
      setIsModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu danh mục");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      categoryName: category.categoryName,
      description: category.description
    });
    setIsModalVisible(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/categories/${id}`);
      message.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      message.error("Lỗi khi xóa danh mục");
    }
  };

  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { title: 'Tên danh mục', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEditCategory(record)} />
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="Tìm kiếm danh mục..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Thêm danh mục
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCategories}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSubmit}>
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Cập nhật" : "Thêm"}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingCategory(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
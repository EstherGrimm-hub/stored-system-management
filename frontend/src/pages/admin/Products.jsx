import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, InputNumber, message, Tag, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/products');
      setProducts(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách hàng hóa");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/categories');
      setCategories(res.data);
    } catch (error) {
      message.error('Không thể tải danh mục hàng hóa');
      setCategories([]);
    }
  };

  const handleAddSubmit = async (values) => {
    try {
      if (editingProduct) {
        await axiosInstance.put(`/api/v1/products/${editingProduct.id}`, values);
        message.success("Cập nhật hàng hóa thành công!");
      } else {
        await axiosInstance.post('/api/v1/products', values);
        message.success("Thêm hàng hóa thành công!");
      }
      setIsModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
      fetchProducts(); // Tải lại bảng
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu hàng hóa");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      sku: product.sku,
      barcode: product.barcode,
      productName: product.productName,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      categoryId: product.categoryId || null
    });
    setIsModalVisible(true);
  };

  const handleCreateCategory = async (values) => {
    try {
      if (editingCategory) {
        await axiosInstance.put(`/api/v1/categories/${editingCategory.id}`, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await axiosInstance.post('/api/v1/categories', values);
        message.success('Thêm danh mục thành công!');
      }
      setIsCategoryModalVisible(false);
      setEditingCategory(null);
      categoryForm.resetFields();
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      categoryName: category.categoryName,
      description: category.description
    });
    setIsCategoryModalVisible(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      content: 'Bạn chắc chắn muốn xóa danh mục này? Tất cả sản phẩm trong danh mục sẽ bị ảnh hưởng.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axiosInstance.delete(`/api/v1/categories/${categoryId}`);
          message.success('Xóa danh mục thành công');
          fetchCategories();
          fetchProducts(); // Cập nhật lại products vì category có thể bị null
        } catch (error) {
          message.error(error.response?.data?.message || 'Lỗi khi xóa danh mục');
        }
      },
    });
  };

  const handleDeleteProduct = async (productId) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: 'Bạn chắc chắn muốn xóa sản phẩm này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axiosInstance.delete(`/api/v1/products/${productId}`);
          message.success('Xóa sản phẩm thành công');
          fetchProducts();
        } catch (error) {
          message.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
        }
      },
    });
  };

  // Cột hiển thị dữ liệu
  const columns = [
    { title: 'Mã Hàng (SKU)', dataIndex: 'sku', key: 'sku', render: text => <strong>{text}</strong> },
    { title: 'Tên Hàng Hóa', dataIndex: 'productName', key: 'productName' },
    { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName' },
    { 
      title: 'Giá Vốn', 
      dataIndex: 'costPrice', 
      render: val => val?.toLocaleString('vi-VN') + ' đ'
    },
    { 
      title: 'Giá Bán', 
      dataIndex: 'sellingPrice', 
      render: val => <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{val?.toLocaleString('vi-VN')} đ</span>
    },
    { 
      title: 'Tồn Kho', 
      dataIndex: 'stockQuantity', 
      render: (val, record) => (
        <Tag color={val <= record.minStockLevel ? 'red' : 'green'}>
          {val}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} style={{ color: '#1890ff' }} onClick={() => handleEditProduct(record)}>
            Sửa
          </Button>
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteProduct(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Lọc dữ liệu theo ô tìm kiếm
  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchText.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Danh mục Hàng hóa</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Thêm hàng hóa
          </Button>
          <Button type="default" onClick={() => { setEditingCategory(null); setIsCategoryModalVisible(true); }}>
            Thêm danh mục
          </Button>
        </Space>
      </div>

      <Input 
        placeholder="Tìm kiếm theo mã hàng hoặc tên hàng..." 
        prefix={<SearchOutlined />} 
        style={{ width: 400, marginBottom: '16px' }}
        onChange={e => setSearchText(e.target.value)}
      />

      <Table 
        columns={columns} 
        dataSource={filteredProducts} 
        rowKey="id" 
        loading={loading}
        bordered
      />

      {/* Danh sách Danh mục */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Danh sách Danh mục</h2>
        <Table 
          columns={[
            { title: 'Tên danh mục', dataIndex: 'categoryName', key: 'categoryName' },
            { title: 'Mô tả', dataIndex: 'description', key: 'description' },
            {
              title: 'Thao tác',
              key: 'action',
              render: (_, record) => (
                <Space size="middle">
                  <Button type="text" icon={<EditOutlined />} style={{ color: '#1890ff' }} onClick={() => handleEditCategory(record)}>
                    Sửa
                  </Button>
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteCategory(record.id)}>
                    Xóa
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={categories}
          rowKey="id"
          bordered
          pagination={false}
        />
      </div>

      {/* Modal Thêm Sản Phẩm */}
      <Modal 
        title={editingProduct ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa mới'} 
        open={isModalVisible} 
        onCancel={() => { setIsModalVisible(false); setEditingProduct(null); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSubmit}>
          <Form.Item name="sku" label="Mã hàng (SKU)" tooltip="Để trống hệ thống sẽ tự sinh mã">
            <Input placeholder="VD: SP001" />
          </Form.Item>
          
          <Form.Item name="productName" label="Tên hàng hóa" rules={[{ required: true, message: 'Vui lòng nhập tên hàng!' }]}>
            <Input placeholder="Nhập tên sản phẩm..." />
          </Form.Item>

          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}> 
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>{cat.categoryName}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item name="costPrice" label="Giá vốn" rules={[{ required: true, message: 'Vui lòng nhập giá vốn!' }, { type: 'number', min: 0, message: 'Giá vốn phải >= 0' }]}>
              <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            
            <Form.Item name="sellingPrice" label="Giá bán" rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }, { type: 'number', min: 0, message: 'Giá bán phải >= 0' }]}>
              <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item name="stockQuantity" label="Tồn kho ban đầu" initialValue={0} rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }, { type: 'number', min: 0, message: 'Tồn kho phải >= 0' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            
            <Form.Item name="minStockLevel" label="Định mức tồn ít nhất" initialValue={5} tooltip="Hệ thống sẽ cảnh báo nếu tồn kho dưới mức này" rules={[{ required: true, message: 'Vui lòng nhập định mức tồn!' }, { type: 'number', min: 0, message: 'Định mức tồn phải >= 0' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Space>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>Lưu hàng hóa</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={isCategoryModalVisible}
        onCancel={() => { setIsCategoryModalVisible(false); setEditingCategory(null); categoryForm.resetFields(); }}
        footer={null}
      >
        <Form form={categoryForm} layout="vertical" onFinish={handleCreateCategory}>
          <Form.Item
            name="categoryName"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên danh mục..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Mô tả danh mục (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingCategory ? 'Cập nhật danh mục' : 'Lưu danh mục'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
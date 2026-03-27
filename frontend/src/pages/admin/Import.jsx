import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, InputNumber, message, Select, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axiosInstance from '../../api/axios';
import dayjs from 'dayjs';

const { Option } = Select;

const Import = () => {
  const [products, setProducts] = useState([]);
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchImports();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/products');
      setProducts(res.data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách sản phẩm");
    }
  };

  const fetchImports = async () => {
    // Note: This would need a backend API to get import history
    // For now, we'll show a placeholder
    setImports([]);
  };

  const handleImportSubmit = async (values) => {
    try {
      const importData = {
        importDate: values.importDate.format('YYYY-MM-DD'),
        supplierName: values.supplierName,
        note: values.note,
        importDetails: values.details.map(detail => ({
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice
        }))
      };

      await axiosInstance.post('/api/v1/imports', importData);
      message.success("Nhập kho thành công!");
      setIsModalVisible(false);
      form.resetFields();
      fetchImports();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi nhập kho");
    }
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Mã sản phẩm', dataIndex: 'sku', key: 'sku' },
    { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
    { title: 'Tồn kho hiện tại', dataIndex: 'stockQuantity', key: 'stockQuantity' },
    { title: 'Đơn giá', dataIndex: 'costPrice', key: 'costPrice', render: val => val ? val.toLocaleString('vi-VN') + ' đ' : '' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Nhập kho
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Nhập kho"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleImportSubmit}>
          <Form.Item
            name="importDate"
            label="Ngày nhập"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nhập!' }]}
            initialValue={dayjs()}
          >
            <DatePicker format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="supplierName"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.List name="details">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                    >
                      <Select placeholder="Chọn sản phẩm" style={{ width: 200 }}>
                        {products.map(product => (
                          <Option key={product.id} value={product.id}>
                            {product.productName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Nhập số lượng' }]}
                    >
                      <InputNumber placeholder="Số lượng" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unitPrice']}
                      rules={[{ required: true, message: 'Nhập đơn giá' }]}
                    >
                      <InputNumber placeholder="Đơn giá" min={0} />
                    </Form.Item>
                    <Button type="link" onClick={() => remove(name)} danger>
                      Xóa
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm sản phẩm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Nhập kho
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
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

export default Import;
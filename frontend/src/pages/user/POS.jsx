import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Table, Button, Card, Typography, message, Divider, Tag } from 'antd';
import { SearchOutlined, DeleteOutlined, ShoppingCartOutlined, DollarOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';

const { Title, Text } = Typography;

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [customerTendered, setCustomerTendered] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/products');
      setProducts(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách hàng hóa");
    }
  };

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      message.error(`Sản phẩm ${product.productName} đã hết hàng!`);
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stockQuantity) {
        message.warning('Số lượng mua vượt quá số lượng tồn kho!');
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const changeAmount = customerTendered - totalAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return message.warning("Chưa có mặt hàng nào trong giỏ!");
    if (customerTendered < totalAmount) return message.error("Khách đưa thiếu tiền!");

    setLoading(true);
    try {
      const payload = {
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        discountAmount: 0,
        customerTendered: customerTendered
      };
      
      await axiosInstance.post('/api/v1/orders/retail', payload);
      
      message.success("Thanh toán thành công!");
      setCart([]); 
      setCustomerTendered(0);
      fetchProducts();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Hàng hóa', dataIndex: 'productName', key: 'productName' },
    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' },
    { title: 'Đơn giá', dataIndex: 'sellingPrice', render: val => val.toLocaleString('vi-VN') },
    { title: 'Thành tiền', render: (_, record) => (record.sellingPrice * record.quantity).toLocaleString('vi-VN') },
    { title: '', render: (_, record) => <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeFromCart(record.id)} /> }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '16px', background: '#f0f2f5', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1600px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>🏪 Point of Sale (POS)</Title>
          <Button 
            type="primary" 
            icon={<SettingOutlined />} 
            size="large"
            onClick={() => navigate('/admin/inventory')}
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
          >
            Quản lý kho
          </Button>
        </div>
        
        <Row gutter={16} style={{ minHeight: 'calc(100vh - 120px)', alignItems: 'stretch' }}>
        
        <Col span={16} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Input 
            size="large" 
            placeholder="Tìm theo tên hoặc quét mã vạch..." 
            prefix={<SearchOutlined />} 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ marginBottom: '16px', borderRadius: '8px' }}
          />
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start' }}>
            {products.filter(p => p.productName.toLowerCase().includes(searchKeyword.toLowerCase())).map(product => (
              <Card 
                key={product.id}
                hoverable
                onClick={() => addToCart(product)}
                style={{ width: '180px', borderRadius: '8px', overflow: 'hidden' }}
                styles={{ body: { padding: '12px', textAlign: 'center' } }}
              >
                <Text strong style={{ display: 'block', height: '40px', overflow: 'hidden' }}>{product.productName}</Text>
                <Title level={5} style={{ color: '#1890ff', margin: '8px 0' }}>{product.sellingPrice.toLocaleString('vi-VN')} đ</Title>
                <Tag color={product.stockQuantity > 0 ? 'green' : 'red'}>
                  Tồn: {product.stockQuantity}
                </Tag>
              </Card>
            ))}
          </div>
        </Col>

        <Col span={8} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Title level={4}><ShoppingCartOutlined /> Giỏ hàng vãng lai</Title>
            
            <div style={{ flex: 1, overflowY: 'auto', borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
              <Table dataSource={cart} columns={columns} pagination={false} rowKey="id" size="small" />
            </div>

            <div>
              <Row justify="space-between" style={{ marginBottom: '12px' }}>
                <Text strong style={{ fontSize: '16px' }}>Tổng tiền:</Text>
                <Text strong style={{ fontSize: '20px', color: '#cf1322' }}>{totalAmount.toLocaleString('vi-VN')} đ</Text>
              </Row>
              <Row justify="space-between" align="middle" style={{ marginBottom: '12px' }}>
                <Text>Khách thanh toán (VNĐ):</Text>
                <Input 
                  type="number" 
                  style={{ width: '160px', textAlign: 'right' }} 
                  value={customerTendered}
                  onChange={(e) => setCustomerTendered(Number(e.target.value))}
                />
              </Row>
              <Row justify="space-between" style={{ marginBottom: '20px' }}>
                <Text>Tiền thối lại:</Text>
                <Text strong>{changeAmount >= 0 ? changeAmount.toLocaleString('vi-VN') : 0} đ</Text>
              </Row>

              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<DollarOutlined />}
                style={{ height: '56px', fontSize: '18px', background: '#52c41a', borderColor: '#52c41a' }}
                onClick={handleCheckout}
                disabled={cart.length === 0}
                loading={loading}
              >
                THANH TOÁN
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div>
  );
};

export default POS;

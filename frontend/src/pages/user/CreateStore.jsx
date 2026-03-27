import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function CreateStore() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await api.post("/api/v1/stores", {
        name: values.storeName,
        address: values.storeAddress
      });

      if (res.data && res.data.id) {
        message.success("Store created successfully");

        // Update local storage state
        const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : {};
        localStorage.setItem("user", JSON.stringify({
          ...user,
          hasStore: true,
          storeId: res.data.id,
          storeName: res.data.name
        }));

        navigate("/admin/dashboard");
      } else {
        message.error(res.data?.message || "Error creating store");
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Server error");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <Card 
        title="Tạo Cửa Hàng" 
        style={{ 
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          borderRadius: "12px"
        }}
        headStyle={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "600",
          border: "none"
        }}
        bodyStyle={{
          padding: "32px 24px"
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Store Name"
            name="storeName"
            rules={[{ required: true, message: "Please enter store name" }]}
          >
            <Input placeholder="Enter store name" />
          </Form.Item>
          <Form.Item
            label="Store Address"
            name="storeAddress"
            rules={[{ required: true, message: "Please enter store address" }]}
          >
            <Input placeholder="Enter store address" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                height: "40px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none"
              }}
            >
              Tạo Cửa Hàng
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateStore;

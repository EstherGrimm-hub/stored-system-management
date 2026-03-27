import { Form, Input, Button, Card, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const { Option } = Select;

function Register() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await api.post("/api/v1/auth/register", {
        fullName: values.fullName,
        username: values.username,
        password: values.password
      });

      if (res.data && (res.data.success || res.data.token)) {
        message.success("Registration successful");
        localStorage.setItem("username", values.username);

        // Auto-login if token provided
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          const userPayload = {
            role: res.data.role,
            fullName: res.data.fullName,
            storeId: res.data.storeId,
            hasStore: res.data.hasStore
          };
          localStorage.setItem("user", JSON.stringify(userPayload));

          if (res.data.role === 'ADMIN') {
            navigate('/admin/super-dashboard');
          } else if (!res.data.hasStore) {
            navigate('/home');
          } else {
            navigate('/admin/dashboard');
          }
        }
      } else {
        message.error(res.data?.message || "Registration failed");
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
        title="Đăng Ký" 
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
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Enter password" />
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
              Đăng Ký
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="link" 
              block 
              onClick={() => navigate('/login')}
              style={{
                color: "#667eea",
                fontSize: "14px"
              }}
            >
              Đã có tài khoản? Đăng nhập
            </Button>
          </Form.Item>

        </Form>

      </Card>

    </div>
  );
}

export default Register;

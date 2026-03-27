import { Form, Input, Button, Card, message, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await api.post("/api/v1/auth/login", {
        username: values.username,
        password: values.password
      });

      if (res.data && res.data.token) {
        // Store token for future requests
        localStorage.setItem("token", res.data.token);

        // Build normalized user object with store status
        const role = res.data.role || (res.data.user && res.data.user.role);
        const storeId = res.data.storeId || (res.data.user && res.data.user.storeId);
        const hasStore = (res.data.hasStore !== undefined)
          ? res.data.hasStore
          : (res.data.user && res.data.user.hasStore) || !!storeId;

        const loggedUser = {
          ...((res.data.user && typeof res.data.user === 'object') ? res.data.user : {}),
          role,
          storeId,
          hasStore
        };

        localStorage.setItem("user", JSON.stringify(loggedUser));

        message.success("Login successful");

        // Route based on user role and store state
        if (role === 'ADMIN') {
          navigate('/admin/super-dashboard');
        } else if (!hasStore) {
          navigate('/home');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        message.error("Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Login failed");
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
        title="Đăng Nhập" 
        style={{ 
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          borderRadius: "12px"
        }}
        styles={{
          header: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "600",
            border: "none"
          },
          body: {
            padding: "32px 24px"
          }
        }}
      >

        <Form layout="vertical" onFinish={onFinish}>

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
              Đăng Nhập
            </Button>
          </Form.Item>

          <Divider style={{ margin: "16px 0", color: "#999" }}>Chưa có tài khoản?</Divider>

          <Form.Item>
            <Button 
              block 
              onClick={() => navigate('/register')}
              style={{
                background: "#f0f2f5",
                color: "#333",
                border: "1px solid #ddd",
                height: "40px",
                fontWeight: "500"
              }}
            >
              Đăng ký tài khoản mới
            </Button>
          </Form.Item>

        </Form>

      </Card>

    </div>
  );
}

export default Login;

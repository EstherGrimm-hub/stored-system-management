import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spin, message } from "antd";
import Header from "../../components/Header";
import Hero from "../../components/Hero";
import api from "../../api/axios";

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/api/v1/users/me")
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error(err);
        message.error("Không thể lấy thông tin người dùng");
      })
      .finally(() => setLoading(false));
  }, []);

  const startCreateStore = () => {
    navigate("/create-store");
  };

  const manageStore = () => {
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Header />
        <Hero />
      </div>
    );
  }

  if (profile.role === "ADMIN") {
    navigate("/admin/super-dashboard");
    return null;
  }

  const hasStore = !!profile.storeId || profile.hasStore;

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
        title={`Xin chào, ${profile.fullName || profile.username}`} 
        style={{ 
          width: "100%",
          maxWidth: 500,
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
          padding: "32px 24px",
          textAlign: "center"
        }}
      >
        {profile.hasStore ? (
          <>
            <p style={{ fontSize: "16px", marginBottom: "24px", color: "#555" }}>
              ✅ Bạn đã có cửa hàng. Hãy vào quản lý cửa hàng ngay.
            </p>
            <Button 
              type="primary" 
              onClick={manageStore} 
              block
              size="large"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                height: "44px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none"
              }}
            >
              📊 Quản lý cửa hàng
            </Button>
          </>
        ) : (
          <>
            <p style={{ fontSize: "16px", marginBottom: "24px", color: "#555" }}>
              ⚠️ Bạn chưa tạo cửa hàng. Vui lòng tạo cửa hàng để có thể quản lý và sử dụng hệ thống.
            </p>
            <Button 
              type="primary" 
              onClick={startCreateStore} 
              block
              size="large"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                height: "44px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none"
              }}
            >
              🏪 Tạo cửa hàng
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default Home;

import { Button, Menu } from "antd";
import { Link } from "react-router-dom";

function Header() {
  return (
    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      padding:"0 80px",
      height:"70px"
    }}>

      <h2 style={{color:"#1d7dfa"}}>HVN</h2>

      <Menu
        mode="horizontal"
        items={[
          { label:"Sản phẩm", key:"1" },
          { label:"Giải pháp", key:"2" },
          { label:"Khách hàng", key:"3" },
          { label:"Phí dịch vụ", key:"4" },
          { label:"Hỗ trợ", key:"5" },
          { label:"Tin tức", key:"6" },
        ]}
      />

      <div>
        <Link to="/login"><Button style={{marginRight:10}}>Đăng nhập</Button></Link>
        <Link to="/register"><Button type="primary">Đăng ký</Button></Link>
      </div>

    </div>
  );
}

export default Header;
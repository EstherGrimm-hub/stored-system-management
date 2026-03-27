import { Button } from "antd";

function Hero(){

  return(
    <div style={{
      display:"flex",
      padding:"80px",
      alignItems:"center",
      justifyContent:"space-between"
    }}>

      <div style={{width:"50%"}}>

        <h1 style={{fontSize:"48px"}}>
          Phần mềm quản lý bán hàng phổ biến nhất
        </h1>

        <div style={{marginTop:20}}>

          <Button type="primary" size="large">
            Dùng thử miễn phí
          </Button>

          <Button size="large" style={{marginLeft:10}}>
            Khám phá
          </Button>

        </div>

        <div style={{marginTop:40, display:"flex", gap:"40px"}}>

          <div>
            <h2>300.000+</h2>
            <p>Nhà kinh doanh sử dụng</p>
          </div>

          <div>
            <h2>10.000+</h2>
            <p>Nhà kinh doanh mới mỗi tháng</p>
          </div>

        </div>

      </div>



    </div>
  )

}

export default Hero
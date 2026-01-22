import { useMemo, useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom"; // 1. Thêm Link
import Orchid from "./Orchid";
import { Row, Col } from "react-bootstrap";
import { getAllOrchids } from "../services/OrchidService"; 

function ListOrchid() {
  const { searchTerm } = useOutletContext() || { searchTerm: "" };

  const [orchids, setOrchids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("name-asc");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllOrchids(); //gọi hàm service
        setOrchids(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOrchids = useMemo(() => {
    if (orchids.length === 0) return [];
    let result = [...orchids];

    if (selectedCategory !== "all") {
      result = result.filter(o => o.category === selectedCategory);
    }
    if (searchTerm && searchTerm.trim() !== "") {
      result = result.filter(o =>
        o.orchidName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortType) {
      case "name-asc": result.sort((a, b) => a.orchidName.localeCompare(b.orchidName)); break;
      case "name-desc": result.sort((a, b) => b.orchidName.localeCompare(a.orchidName)); break;
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      default: break;
    }
    return result;
  }, [searchTerm, sortType, selectedCategory, orchids]);

  const categories = useMemo(() => {
    return ["all", ...new Set(orchids.map(o => o.category))];
  }, [orchids]);

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  return (
    <div className="container">
       {/* 2. Cập nhật phần thanh công cụ */}
       <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3">
        
        {/* Nhóm Filter và Sort nằm bên trái */}
        <div className="d-flex gap-2">
            <select className="form-select w-auto" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => <option key={cat} value={cat}>{cat === "all" ? "Tất cả loại" : cat}</option>)}
            </select>
            
            <select className="form-select w-auto" value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="name-asc">Tên A → Z</option>
            <option value="name-desc">Tên Z → A</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            </select>
        </div>

        {/* Nút Thao tác (Dashboard) nằm bên phải */}
        <Link to="/dashboard" className="btn btn-primary">
            ⚙️ Quản lý (CRUD)
        </Link>
        
      </div>

      {filteredOrchids.length === 0 && <div className="alert alert-warning text-center">❌ Không tìm thấy sản phẩm phù hợp</div>}

      <Row className="g-3">
        {filteredOrchids.map((orchid) => (
          <Col key={orchid.id} xs={12} sm={6} md={4} lg={3}>
            <Orchid orchid={orchid} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default ListOrchid;
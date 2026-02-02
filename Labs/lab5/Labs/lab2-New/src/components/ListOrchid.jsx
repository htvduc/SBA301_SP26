import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Orchid from "./Orchid";
import { OrchidsData } from "../data/OrchidData";
import { Row, Col } from "react-bootstrap";

function ListOrchid() {
  // ✅ Nhận searchTerm từ MainLayout
  const { searchTerm } = useOutletContext() || { searchTerm: "" };

  const [sortType, setSortType] = useState("name-asc");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredOrchids = useMemo(() => {
    let result = [...OrchidsData];

    // 1. FILTER BY CATEGORY
    if (selectedCategory !== "all") {
      result = result.filter(o => o.category === selectedCategory);
    }

    // 2. SEARCH
    if (searchTerm && searchTerm.trim() !== "") {
      result = result.filter(o =>
        o.orchidName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. SORT
    switch (sortType) {
      case "name-asc":
        result.sort((a, b) => a.orchidName.localeCompare(b.orchidName));
        break;
      case "name-desc":
        result.sort((a, b) => b.orchidName.localeCompare(a.orchidName));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [searchTerm, sortType, selectedCategory]);

  // Lấy danh sách category từ data
  const categories = useMemo(() => {
    return ["all", ...new Set(OrchidsData.map(o => o.category))];
  }, []);

  return (
    <div className="container">

      {/* Filter + Sort */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">

        {/* Category filter */}
        <select
          className="form-select w-auto"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === "all" ? "Tất cả" : cat}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="form-select w-auto"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="name-asc">Tên A → Z</option>
          <option value="name-desc">Tên Z → A</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>

      </div>

      {/* Không có kết quả */}
      {filteredOrchids.length === 0 && (
        <div className="alert alert-warning text-center">
          ❌ Không tìm thấy sản phẩm phù hợp
        </div>
      )}

      {/* List - Responsive grid */}
      <Row className="g-3">
        {filteredOrchids.map((orchid) => (
          <Col
            key={orchid.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
          >
            <Orchid orchid={orchid} />
          </Col>
        ))}
      </Row>

    </div>
  );
}

export default ListOrchid;

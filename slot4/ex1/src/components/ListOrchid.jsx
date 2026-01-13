import { useState, useMemo } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Orchid from "./Orchid";
import FilterSort from "./FilterSort";
import { OrchidsData } from "../data/OrchidData";

function ListOrchid({ searchTerm = "" }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  // `searchTerm` and `onSearchChange` are received from props (lifted to App)

  // Lấy danh sách category không trùng
  const categories = useMemo(() => {
    return [...new Set(OrchidsData.map((o) => o.category))];
  }, []);

  // Xử lý filter + sort
  const processedOrchids = useMemo(() => {
    let result = [...OrchidsData];

    // FILTER
    if (selectedCategory) {
      result = result.filter((o) => o.category === selectedCategory);
    }

    // SEARCH: use prop `searchTerm` if provided
    if (typeof searchTerm !== "undefined" && searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter((o) => o.orchidName.toLowerCase().includes(s));
    }

    // SORT
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.orchidName.localeCompare(b.orchidName));
        break;
      case "name-desc":
        result.sort((a, b) => b.orchidName.localeCompare(a.orchidName));
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategory, sortOption, searchTerm]);

  return (
    <Container className="py-4 align-self-start">
      <h2 className="mb-4 text-center">🌸 Orchid Collection</h2>

      {/* FILTER + SORT BAR */}
      <FilterSort
        categories={categories}
        onFilterChange={setSelectedCategory}
        onSortChange={setSortOption}
      />

      {/* LIST */}
      <Row className="g-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 align-items-start">
        {processedOrchids.map((o) => (
          <Col key={o.id} className="align-self-start">
            <Orchid orchid={o} />
          </Col>
        ))}
      </Row>


    </Container>
  );
}

export default ListOrchid;

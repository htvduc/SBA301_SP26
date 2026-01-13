// FilterSort.jsx to filter and sort orchids
import React from "react";
import { Form, Row, Col } from "react-bootstrap";

function FilterSort({ categories, onFilterChange, onSortChange }) {
  const handleFilterChange = (e) => {
    onFilterChange(e.target.value);
  };

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <Form className="mb-4">
      <Row>
        {/* FILTER BY CATEGORY */}
        <Col md={6}>
          <Form.Group controlId="filterCategory">
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* SORT SECTION */}
        <Col md={6}>
          <Form.Group controlId="sortOrchids">
            <Form.Label>Sort by</Form.Label>
            <Form.Select onChange={handleSortChange}>
              <option value="">No Sorting</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
}

export default FilterSort;

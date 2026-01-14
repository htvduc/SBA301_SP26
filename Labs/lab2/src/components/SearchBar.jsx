import React from "react";

function SearchBar({ value, onChange }) {
  return (
    <div className="mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="Search by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search orchids by name"
      />
    </div>
  );
}

export default SearchBar;

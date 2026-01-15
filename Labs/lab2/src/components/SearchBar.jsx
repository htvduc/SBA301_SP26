import React from "react";

function SearchBar({ value, onChange }) {
  return (
    <div>
      <input
        type="text"
        className="form-control"
        placeholder="Search by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ height: "38px" }}
      />
    </div>
  );
}

export default SearchBar;

import React from "react";
// Đừng quên import file CSS nếu bạn để CSS ở file riêng, hoặc dùng App.css
import "../App.css"; 

function SearchBar({ value, onChange }) {
  return (
    <div>
      <input
        type="text"
        // Thêm class 'custom-search-input' để chỉnh placeholder bên CSS
        className="form-control custom-search-input" 
        placeholder="Search by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ 
            height: "38px",
            color: "#000",      // 👉 1. Chữ nhập vào màu đen tuyệt đối
            fontWeight: "500"   // 👉 2. Chữ nhập vào dày hơn bình thường
        }}
      />
    </div>
  );
}

export default SearchBar;
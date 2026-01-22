import axios from 'axios';

// Đường dẫn gốc của API (Json-Server)
const API_URL = 'http://localhost:5000'; 

// ==========================
// 1. READ (Đọc dữ liệu)
// ==========================

// Lấy toàn bộ danh sách hoa
export const getAllOrchids = async () => {
    const response = await axios.get(`${API_URL}/orchids`); 
    return response.data;
};

// Lấy chi tiết một bông hoa theo ID
export const getOrchidById = async (id) => {
    const response = await axios.get(`${API_URL}/orchids/${id}`);
    return response.data;
};


// ==========================
// 2. CREATE (Tạo mới)
// ==========================

// Thêm một bông hoa mới
// data: là object chứa thông tin hoa (name, price, image...)
export const createOrchid = async (orchidData) => {
    const response = await axios.post(`${API_URL}/orchids`, orchidData);
    return response.data;
};

// ==========================
// 3. UPDATE (Cập nhật)
// ==========================

// Cập nhật thông tin hoa
// id: id của hoa cần sửa
// orchidData: thông tin mới cần lưu
export const updateOrchid = async (id, orchidData) => {
    const response = await axios.put(`${API_URL}/orchids/${id}`, orchidData);
    return response.data;
};

// ==========================
// 4. DELETE (Xóa)
// ==========================

// Xóa một bông hoa theo ID
export const deleteOrchid = async (id) => {
    const response = await axios.delete(`${API_URL}/orchids/${id}`);
    return response.data;
};
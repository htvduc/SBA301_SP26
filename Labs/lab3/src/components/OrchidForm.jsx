import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Container, Card } from "react-bootstrap";
// Import thêm getAllOrchids để lấy danh sách tính ID mới
import { createOrchid, getOrchidById, updateOrchid, getAllOrchids } from "../services/OrchidService";
import { toast } from "react-toastify"; 

const OrchidForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id; 

  const [formData, setFormData] = useState({
    orchidName: "",
    price: "",
    category: "Dendrobium",
    image: "",
    description: "", 
    isSpecial: false,
  });

  useEffect(() => {
    if (isEditMode) {
      const loadDetail = async () => {
        try {
          const data = await getOrchidById(id);
          setFormData(data);
        } catch (error) {
          console.error("Lỗi tải chi tiết:", error);
        }
      };
      loadDetail();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // --- LOGIC CẬP NHẬT ---
        await updateOrchid(id, formData);
        toast.success("Cập nhật thành công!");
      } else {
        // --- LOGIC TẠO MỚI (TỰ TĂNG ID) ---
        // 1. Lấy toàn bộ danh sách hiện có
        const allOrchids = await getAllOrchids();
        
        // 2. Tìm ID lớn nhất (chuyển về số nguyên để so sánh)
        const maxId = allOrchids.reduce((max, item) => {
            const currentId = parseInt(item.id);
            // Kiểm tra nếu ID là số hợp lệ thì so sánh, không thì bỏ qua
            return !isNaN(currentId) ? Math.max(max, currentId) : max;
        }, 0);

        // 3. Tạo ID mới = Max + 1, sau đó ép lại về chuỗi
        const newId = (maxId + 1).toString();

        // 4. Gán ID mới vào object
        const newOrchidData = { ...formData, id: newId };
        
        await createOrchid(newOrchidData);
        toast.success(`Thêm mới thành công! (ID: ${newId})`);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <Container className="d-flex justify-content-center mt-4 mb-5">
      <Card style={{ width: "600px" }}>
        <Card.Header className="bg-primary text-white">
          <h4>{isEditMode ? "Cập nhật Hoa Lan" : "Thêm Hoa Lan Mới"}</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên hoa</Form.Label>
              <Form.Control type="text" name="orchidName" value={formData.orchidName} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giá (VNĐ)</Form.Label>
              <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required />
              {/* Hiển thị xem trước giá tiền cho dễ nhìn */}
              {formData.price && (
                <Form.Text className="text-success fw-bold">
                  Hiển thị: {Number(formData.price).toLocaleString('en-US')} đ
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Link Ảnh (URL)</Form.Label>
              <Form.Control type="text" name="image" value={formData.image} onChange={handleChange} required />
            </Form.Group>

            {/* ✅ ĐÃ THÊM PHẦN NHẬP DESCRIPTION */}
            <Form.Group className="mb-3">
              <Form.Label>Mô tả chi tiết</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleChange}>
                <option value="Dendrobium">Dendrobium</option>
                <option value="Phalaenopsis">Phalaenopsis</option>
                <option value="Cattleya">Cattleya</option>
                <option value="Oncidium">Oncidium</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="Là loài đặc biệt?" name="isSpecial" checked={formData.isSpecial} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate("/dashboard")}>Hủy</Button>
              <Button variant="primary" type="submit">{isEditMode ? "Lưu thay đổi" : "Tạo mới"}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrchidForm;
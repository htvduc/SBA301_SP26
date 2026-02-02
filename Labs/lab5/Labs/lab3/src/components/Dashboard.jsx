import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Container, Image } from "react-bootstrap";
import { getAllOrchids, deleteOrchid } from "../services/OrchidService";
import { toast } from "react-toastify"; 

// 👇 1. Import Component Modal vừa tạo
import ConfirmModal from "./ConfirmModal"; 

const Dashboard = () => {
  const [orchids, setOrchids] = useState([]);

  // 👇 2. Thêm state để quản lý Modal và ID cần xóa
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // Lưu ID tạm thời để biết xóa cái nào

  // Load data giữ nguyên
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllOrchids();
        setOrchids(data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        toast.error("Không thể tải dữ liệu!");
      }
    };
    loadData();
  }, []);

  // 👇 3. Hàm này chạy khi bấm nút "Xóa" trên bảng (CHỈ MỞ MODAL)
  const handleOpenDeleteModal = (id) => {
    setDeleteId(id);    // Lưu ID vào state
    setShowModal(true); // Mở Modal lên
  };

  // 👇 4. Hàm này chạy khi bấm nút "Xác nhận" trong Modal (THỰC HIỆN XÓA THẬT)
  const handleConfirmDelete = async () => {
    if (!deleteId) return; // Kiểm tra an toàn

    try {
      await deleteOrchid(deleteId);
      
      // Cập nhật giao diện
      setOrchids((prevOrchids) => prevOrchids.filter((item) => item.id !== deleteId));
      
      toast.success("🗑️ Đã xóa thành công!", {
        position: "top-right",
        autoClose: 2000
      });

    } catch (error) {
      console.error(error);
      toast.error("❌ Xóa thất bại, vui lòng thử lại!");
    } finally {
      // Đóng modal và reset ID dù thành công hay thất bại
      setShowModal(false);
      setDeleteId(null);
    }
  };

  // Hàm đóng modal khi bấm Hủy
  const handleCloseModal = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>📊 Quản lý Kho Hoa</h2>
        <Link to="/add" className="btn btn-success">
          + Thêm mới
        </Link>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Hình ảnh</th>
            <th>Tên hoa</th>
            <th>Giá</th>
            <th>Loại</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orchids.map((orchid) => (
            <tr key={orchid.id}>
              <td>{orchid.id}</td>
              <td>
                <Image 
                  src={orchid.image} 
                  style={{ width: "50px", height: "50px", objectFit: "cover" }} 
                  rounded 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                />
              </td>
              <td>{orchid.orchidName}</td>
              <td>{Number(orchid.price).toLocaleString('en-US')} đ</td>
              <td>{orchid.category}</td>
              <td>
                <Link to={`/edit/${orchid.id}`} className="btn btn-warning btn-sm me-2">
                  🖊 Sửa
                </Link>
                {/* 👇 Sửa onClick: Gọi hàm mở modal thay vì xóa luôn */}
                <Button variant="danger" size="sm" onClick={() => handleOpenDeleteModal(orchid.id)}>
                  🗑 Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 👇 5. Render ConfirmModal ở cuối cùng */}
      <ConfirmModal 
        show={showModal}
        handleClose={handleCloseModal}
        title="Xác nhận xóa"
        body="Bạn có chắc chắn muốn xóa bông hoa lan này không? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
      />
      
    </Container>
  );
};

export default Dashboard;
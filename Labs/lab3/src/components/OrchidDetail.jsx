import { useParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import { useState, useEffect } from "react";
// 1. Import hàm từ service
import { getOrchidById } from "../services/OrchidService"; 

function OrchidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orchid, setOrchid] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Sử dụng hàm service
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getOrchidById(id); // Gọi hàm, truyền id
        setOrchid(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) return <Container className="py-4">Đang tải chi tiết...</Container>;

  if (!orchid) {
    return (
      <Container className="py-4">
        <h3>Orchid not found</h3>
        <Button variant="secondary" onClick={() => navigate("/")}>Back to list</Button>
      </Container>
    );
  }

  // ... (Phần return giao diện giữ nguyên y hệt cũ) ...
  return (
    <Container className="py-4">
      <Button variant="secondary" onClick={() => navigate("/")}>Back to list</Button>
      <Card className="mt-3">
        <div style={{ width: "100%", overflow: "hidden" }}>
          <img src={orchid.image} alt={orchid.orchidName} className="img-fluid rounded" style={{ width: "100%", height: 400, objectFit: "cover" }} />
        </div>
        <Card.Body>
          <Card.Title>{orchid.orchidName}</Card.Title>
          <p><strong>Category:</strong> {orchid.category}</p>
          <p>{orchid.description}</p>
          <p className="fw-bold text-danger">{orchid.price.toLocaleString()} VND</p>
          {orchid.isSpecial ? <Badge bg="danger">Special</Badge> : <Badge bg="secondary">Normal</Badge>}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OrchidDetail;
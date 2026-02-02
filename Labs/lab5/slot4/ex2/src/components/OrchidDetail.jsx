import { useParams, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import { OrchidsData } from "../data/OrchidData";

function OrchidDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orchid = OrchidsData.find((o) => o.id === id);

  if (!orchid) {
    return (
      <Container className="py-4">
        <h3>Orchid not found</h3>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to list
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate("/")}>
        &larr; Back to list
      </Button>

      <Card className="mt-3">
        <div style={{ width: "100%", overflow: "hidden" }}>
          <img
            src={orchid.image}
            alt={orchid.orchidName}
            className="img-fluid rounded"
            style={{ width: "100%", height: 400, objectFit: "cover" }}
          />
        </div>

        <Card.Body>
          <Card.Title>{orchid.orchidName}</Card.Title>

          <p>
            <strong>Category:</strong> {orchid.category}
          </p>

          <p>{orchid.description}</p>

          <p className="fw-bold text-danger">{orchid.price.toLocaleString()} VND</p>

          {orchid.isSpecial ? (
            <Badge bg="danger">Special</Badge>
          ) : (
            <Badge bg="secondary">Normal</Badge>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OrchidDetail;
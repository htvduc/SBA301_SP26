import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function Orchid({ orchid }) {
  const navigate = useNavigate();

  const goToDetail = () => navigate(`/orchid/${orchid.id}`);

  return (
    <Card className="h-100 shadow-sm">
      {/* Image */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: "100%",
            height: "220px",
            overflow: "hidden",
          }}
        >
          <img
            src={orchid.image}
            alt={orchid.orchidName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {orchid.isSpecial && (
          <span
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "red",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Special
          </span>
        )}
      </div>

      {/* Body */}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-6 text-truncate">
          {orchid.orchidName}
        </Card.Title>

        <Card.Text className="text-muted mb-1">
          {orchid.category}
        </Card.Text>

        <Card.Text style={{ fontSize: "14px" }} className="flex-grow-1">
          {orchid.description.length > 80
            ? orchid.description.substring(0, 80) + "..."
            : orchid.description}
        </Card.Text>

        <p className="fw-bold text-danger mb-2">
          {orchid.price.toLocaleString()} VND
        </p>

        <Button variant="primary" onClick={goToDetail}>
          Detail
        </Button>
      </Card.Body>
    </Card>
  );
}

export default Orchid;

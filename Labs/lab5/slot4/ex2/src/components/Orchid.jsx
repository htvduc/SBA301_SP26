import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function Orchid({ orchid }) {
  const navigate = useNavigate();

  const goToDetail = () => navigate(`/orchid/${orchid.id}`);

  return (
    <Card style={{ width: "100%" }} className="app-card h-auto">
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: "100%",
            height: "250px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              padding: "5px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Special
          </span>
        )}
      </div>

      <Card.Body>
        <Card.Title>{orchid.orchidName}</Card.Title>
        <Card.Text>{orchid.category}</Card.Text>

        <Card.Text style={{ fontSize: "14px" }}>
          {orchid.description.substring(0, 80)}...
        </Card.Text>

        <p className="fw-bold text-danger">{orchid.price.toLocaleString()} VND</p>

        <Button variant="primary" onClick={goToDetail}>
          Detail
        </Button>
      </Card.Body>
    </Card>
  );
}

export default Orchid;
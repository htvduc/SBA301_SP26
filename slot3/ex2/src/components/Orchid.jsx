import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function Orchid({ image, id, orchidName, description, category, isSpecial }) {
  return (
    <Card style={{ height: "100%" }}>
  <div className="position-relative">
    <Card.Img
      variant="top"
      src={image}
      style={{ height: "250px", objectFit: "cover" }}
    />

    {isSpecial && (
      <span
        className="badge bg-danger position-absolute"
        style={{ top: "10px", right: "10px", zIndex: 1 }}
      >
        Special
      </span>
    )}
  </div>


      <Card.Body>
        <Card.Title>{orchidName}</Card.Title>
        <Card.Text>{category}</Card.Text>

        {/* <Card.Text style={{ fontSize: "14px" }}>
          {description.substring(0, 80)}...
        </Card.Text> */}

        

        <div className="mt-2">
          <Button variant="primary">Detail</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Orchid;

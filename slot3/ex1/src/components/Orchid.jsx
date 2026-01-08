import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Card from "react-bootstrap/esm/Card";

function Orchid({ image, id, orchidName, description, price, isSpecial }) {
  return (
    <div>
      <Container className="py-5">
        <Row>
          <Col>
            <h2>Hoa phong lan</h2>
            <Card>
              <Card.Img variant="top" src={image} />
              <Card.Body>
                <Card.Title>{orchidName}</Card.Title>
                <Card.Text>
                  <p>id: {id}</p>
                  <p>orchidName: {orchidName}</p>
                </Card.Text>
                <Card.Text>Description: {description}</Card.Text>
                <Card.Text>Price: ${price}</Card.Text>
                <Card.Text>isSpecial: {isSpecial.toString()}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Orchid;

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Orchid from "./Orchid";
import { OrchidsData } from "../data/OrchidData";

function ListOrchid() {
  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">🌸 Orchid Collection</h2>

      <Row>
        {OrchidsData.map((o) => (
          <Col key={o.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Orchid orchid={o} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ListOrchid;

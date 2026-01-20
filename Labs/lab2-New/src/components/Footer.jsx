import { Container, Row, Col, Image } from "react-bootstrap";

function Footer({ avatar, name, email }) {
  return (
    <footer className="bg-light py-4 border-top">
      <Container>
        <Row className="align-items-center">
          <Col xs="auto">
            <Image
              src={avatar}
              roundedCircle
              width={50}
              height={50}
              alt="avatar"
            />
          </Col>
          <Col>
            <h6 className="mb-0">Tác giả: {name}</h6>
            <p className="mb-0 text-muted small">All rights reserved</p>
          </Col>
          <Col xs="auto" className="ms-auto">
            <h6 className="mb-0">Thông tin liên hệ</h6>
            <p className="mb-0">{email}</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;

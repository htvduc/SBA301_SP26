import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <Navbar bg="light">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">FPT University</Navbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/about">About</Nav.Link>
          <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  )
}

export default Header

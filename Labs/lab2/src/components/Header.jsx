import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import CarouselSlider from "./Carousel";

function Header({ searchTerm, onSearchChange, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  // ✅ Chỉ hiện carousel ở trang chủ
  const showCarousel = location.pathname === "/";

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <Navbar bg="dark" data-bs-theme="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            OrchidShop
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            </Nav>

            <div className="d-flex align-items-center gap-2 ms-auto">

              <div style={{ width: 250, marginTop: "5px" }}>
                <SearchBar
                  value={searchTerm}
                  onChange={onSearchChange}
                />
              </div>

          
              <Button
                variant="outline-light"
                style={{ height: "38px" }}
                onClick={handleLogout}
              >
                Logout
              </Button>

            </div>


          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ===== CAROUSEL ===== */}
      {showCarousel && <CarouselSlider />}
    </>
  );
}

export default Header;

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Orchid from "./components/Orchid";
import About from "./components/About";
import Contact from "./components/Contact";
import { OrchidsData } from "./components/ListOrchid";

function App() {
  return (
    <Router>
      <Header />

      <main style={{ minHeight: "70vh" }} className="mt-4">
        <Routes>
          {/* HOME - LIST ORCHID */}
          <Route
            path="/"
            element={
              <Container fluid>
                <Row>
                  {OrchidsData.map((o) => (
                    <Col key={o.id} xs={12} md={6} lg={3} className="mb-4">
                      <Orchid {...o} />
                    </Col>
                  ))}
                </Row>
              </Container>
            }
          />

          {/* ABOUT */}
          <Route path="/about" element={<About />} />

          {/* CONTACT */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer
        avatar="/images/avatar.jpg"
        name="DucHTV"
        email="hoangtongvietduc@gmail.com"
      />
    </Router>
  );
}

export default App;

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./components/About";
import Contact from "./components/Contact";
import ListOrchid from "./components/ListOrchid";

function App() {
  return (
    <Router>
      <Header />

      <main style={{ minHeight: "70vh" }} className="mt-4">
        <Routes>
          <Route path="/" element={<ListOrchid />} />
          <Route path="/about" element={<About />} />
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

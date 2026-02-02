import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Orchid from "./components/Orchid";
import About from "./components/About";
import Contact from "./components/Contact";

function App() {
  return (
    <Router>
      <Header />
      <br />
      <main style={{ minHeight: "70vh" }}>
        <Routes>
          <Route
            path="/"
            element={
              <Orchid
                image="https://www.espoma.com/wp-content/uploads/2021/03/lead-image.jpg    "
                id="1"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta lobortis ex. Morbi cursus consectetur diam, non lobortis massa gravida eu. Duis molestie purus vel ligula suscipit, sit amet iaculis justo tempus. Cras pellentesque urna in feugiat fringilla. Vivamus dictum lacinia nulla, id rhoncus lectus fermentum et. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta lobortis ex. or sit amet, consectetur adipiscing elit. Nulla porta lobortis ex. or sit amet, consectetur adipiscing elit"
                orchidName="Ceasar 4N"
                price="30.0"
                isSpecial="true"
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <br />
      <Footer
        avatar="/images/avatar.jpg"
        name="DucHTV"
        email="hoangtongvietduc@gmail.com"
      />
    </Router>
  );
}
export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import CarsManagement from './pages/CarsManagement';
import CarTable from './components/CarTable';
import { Container } from 'react-bootstrap';
import './App.css';

const Home = () => (
  <Container className="mt-5">
    <div className="text-center mb-5 p-5 bg-light rounded-3 shadow-sm border border-secondary border-opacity-25 animate-fade-in">
      <h1 className="display-4 fw-bold text-dark">Welcome to Car Store Management</h1>
      <p className="lead text-muted">Explore our collection of premium vehicles with real-time stock and pricing.</p>
      <hr className="my-4 mx-auto w-25 border-top border-primary border-3" />
    </div>
  </Container>
);

function App() {
  return (
    <Router>
      <div className="App min-vh-100 bg-white">
        <NavigationBar />
        <Container fluid="lg" className="px-3 px-md-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<CarsManagement />} />
            <Route path="/cars/create" element={<CarsManagement />} />
          </Routes>
        </Container>
        <footer className="footer mt-auto py-4 bg-dark text-white-50 text-center">
          <Container>
            <span>&copy; 2026 CarStore PE Spring 25. Built with React & Spring Boot.</span>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;

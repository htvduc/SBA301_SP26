import Header from './components/Header'
import Footer from './components/Footer'
import { Routes, Route } from 'react-router-dom'
import About from './pages/About'
import Contact from './pages/Contact'

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">

      <Header />

      <main className="flex-fill d-flex justify-content-center align-items-center">
        <Routes>
          <Route path="/" element={<h1>Chào mừng đến môn SBA301</h1>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />

    </div>
  )
}

export default App

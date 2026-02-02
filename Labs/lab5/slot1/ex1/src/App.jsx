import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">

      <Header />

      <main className="flex-fill d-flex justify-content-center align-items-center">
        <h1>Chào mừng đến với môn SBA301</h1>
      </main>

      <Footer />

    </div>
  );
}


export default App

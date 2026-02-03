import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router ở đây
import { AuthProvider } from './stores/AuthContext';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; // Đảm bảo import index.css với font settings

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* 1. Router bọc ngoài cùng */}
      <AuthProvider> {/* 2. AuthProvider nằm trong Router */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    telephone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await authApi.register(form);
      setSuccess('Register success. Please login.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Register failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Customer Register</h1>
      <form className="form card" onSubmit={onSubmit}>
        {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
        {success && <div style={{ color: '#15803d' }}>{success}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="form-input"
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="form-input"
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="telephone">
            Telephone
          </label>
          <input
            id="telephone"
            className="form-input"
            name="telephone"
            value={form.telephone}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="form-input"
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Registering...' : 'Register'}
        </button>

        <p style={{ fontSize: '0.85rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
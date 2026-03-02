import React, { useEffect, useState } from 'react';
import staffApi from '../api/staffApi';
import LoadingSpinner from '../components/LoadingSpinner';

function StaffCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // customer object
  const [form, setForm] = useState({
    customerFullName: '',
    email: '',
    telephone: '',
    customerBirthday: ''
  });

  const loadData = () => {
    setLoading(true);
    staffApi
      .getCustomers()
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEdit = (c) => {
    setEditing(c);
    setForm({
      customerFullName: c.customerFullName || '',
      email: c.email || '',
      telephone: c.telephone || '',
      customerBirthday: c.customerBirthday || ''
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      customerFullName: '',
      email: '',
      telephone: '',
      customerBirthday: ''
    });
  };

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await staffApi.updateCustomer(editing.customerID, form);
      } else {
        await staffApi.createCustomer(form);
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving customer');
    }
  };

  const onDelete = async (c) => {
    if (!window.confirm(`Delete customer ${c.customerFullName}?`)) return;
    try {
      await staffApi.deleteCustomer(c.customerID);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Cannot delete customer');
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Customers</h1>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1.2fr', gap: '1rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem' }}>Customer List</h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full name</th>
                  <th>Email</th>
                  <th>Telephone</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(customers) ? customers : []).map((c) => (
                  <tr key={c.customerID}>
                    <td>{c.customerID}</td>
                    <td>{c.customerFullName}</td>
                    <td>{c.email}</td>
                    <td>{c.telephone}</td>
                    <td>
                      <button
                        className="btn secondary"
                        style={{ marginRight: '0.25rem' }}
                        onClick={() => startEdit(c)}
                      >
                        Edit
                      </button>
                      <button className="btn danger" onClick={() => onDelete(c)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem' }}>
            {editing ? 'Edit Customer' : 'Create Customer'}
          </h2>
          <form className="form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="customerFullName">
                Full name
              </label>
              <input
                id="customerFullName"
                className="form-input"
                name="customerFullName"
                value={form.customerFullName}
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
              <label className="form-label" htmlFor="customerBirthday">
                Birthday (YYYY-MM-DD)
              </label>
              <input
                id="customerBirthday"
                className="form-input"
                type="date"
                name="customerBirthday"
                value={form.customerBirthday || ''}
                onChange={onChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" type="submit">
                Save
              </button>
              {editing && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StaffCustomersPage;
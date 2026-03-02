import React, { useEffect, useState } from 'react';
import customerApi from '../api/customerApi';
import LoadingSpinner from '../components/LoadingSpinner';

function CustomerProfilePage() {
  const [form, setForm] = useState({
    customerFullName: '',
    email: '',
    telephone: '',
    customerBirthday: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Password change
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    customerApi
      .getProfile()
      .then((data) => {
        setForm({
          customerFullName: data.customerFullName || '',
          email: data.email || '',
          telephone: data.telephone || '',
          customerBirthday: data.customerBirthday || ''
        });
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!form.customerFullName.trim()) errs.customerFullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!validateProfile()) return;
    setSaving(true);
    try {
      await customerApi.updateProfile(form);
      setMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Update profile failed' });
    } finally {
      setSaving(false);
    }
  };

  // Password handlers
  const onPwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.oldPassword) errs.oldPassword = 'Current password is required';
    if (!pwForm.newPassword) errs.newPassword = 'New password is required';
    else if (pwForm.newPassword.length < 3) errs.newPassword = 'Password must be at least 3 characters';
    if (!pwForm.confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onPwSubmit = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (!validatePw()) return;
    setChangingPw(true);
    try {
      await customerApi.changePassword(pwForm.oldPassword, pwForm.newPassword);
      setPwMsg({ type: 'success', text: 'Password changed successfully' });
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errMsg = err.response?.data || 'Password change failed';
      setPwMsg({ type: 'error', text: errMsg });
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="page-title">My Profile</h1>

      <form className="form card" onSubmit={onSubmit}>
        {msg.text && <div className={`form-message ${msg.type}`}>{msg.text}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="customerFullName">Full name</label>
          <input
            id="customerFullName"
            className={`form-input ${errors.customerFullName ? 'error' : ''}`}
            name="customerFullName"
            value={form.customerFullName}
            onChange={onChange}
          />
          {errors.customerFullName && <span className="field-error">{errors.customerFullName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="telephone">Telephone</label>
          <input
            id="telephone"
            className="form-input"
            name="telephone"
            value={form.telephone}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="customerBirthday">Birthday</label>
          <input
            id="customerBirthday"
            className="form-input"
            type="date"
            name="customerBirthday"
            value={form.customerBirthday || ''}
            onChange={onChange}
          />
        </div>

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Password change */}
      <h2 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '0.5rem' }}>Change Password</h2>
      <form className="form card" onSubmit={onPwSubmit}>
        {pwMsg.text && <div className={`form-message ${pwMsg.type}`}>{pwMsg.text}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="oldPassword">Current Password</label>
          <input
            id="oldPassword"
            className={`form-input ${pwErrors.oldPassword ? 'error' : ''}`}
            type="password"
            name="oldPassword"
            value={pwForm.oldPassword}
            onChange={onPwChange}
          />
          {pwErrors.oldPassword && <span className="field-error">{pwErrors.oldPassword}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            className={`form-input ${pwErrors.newPassword ? 'error' : ''}`}
            type="password"
            name="newPassword"
            value={pwForm.newPassword}
            onChange={onPwChange}
          />
          {pwErrors.newPassword && <span className="field-error">{pwErrors.newPassword}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            className={`form-input ${pwErrors.confirmPassword ? 'error' : ''}`}
            type="password"
            name="confirmPassword"
            value={pwForm.confirmPassword}
            onChange={onPwChange}
          />
          {pwErrors.confirmPassword && <span className="field-error">{pwErrors.confirmPassword}</span>}
        </div>

        <button className="btn" type="submit" disabled={changingPw}>
          {changingPw ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default CustomerProfilePage;
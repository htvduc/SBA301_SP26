import React, { useEffect, useState } from 'react';
import staffApi from '../api/staffApi';
import roomApi from '../api/roomApi';
import LoadingSpinner from '../components/LoadingSpinner';

function StaffRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    roomNumber: '',
    roomDetailDescription: '',
    roomMaxCapacity: 1,
    roomStatus: 1,
    roomPricePerDay: 0,
    roomTypeID: ''
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([staffApi.getRooms(), roomApi.getTypes()])
      .then(([roomsRes, typesRes]) => {
        setRooms(Array.isArray(roomsRes) ? roomsRes : []);
        setRoomTypes(Array.isArray(typesRes) ? typesRes : []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const startEdit = (r) => {
    setEditing(r);
    const rt = r.roomType;
    const typeId = rt?.roomTypeID ?? rt?.room_typeid ?? rt?.roomTypeId;
    setForm({
      roomNumber: r.roomNumber || '',
      roomDetailDescription: r.roomDetailDescription || '',
      roomMaxCapacity: r.roomMaxCapacity || 1,
      roomStatus: r.roomStatus ?? 1,
      roomPricePerDay: r.roomPricePerDay || 0,
      roomTypeID: typeId != null ? String(typeId) : ''
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      roomNumber: '',
      roomDetailDescription: '',
      roomMaxCapacity: 1,
      roomStatus: 1,
      roomPricePerDay: 0,
      roomTypeID: ''
    });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'roomMaxCapacity' || name === 'roomStatus'
          ? Number(value) || 0
          : name === 'roomPricePerDay'
            ? (value === '' ? 0 : Number(value) || 0)
            : name === 'roomTypeID'
              ? value
              : value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      roomPricePerDay: Number(form.roomPricePerDay) || 0,
      roomType: form.roomTypeID ? { roomTypeID: Number(form.roomTypeID) } : null
    };

    try {
      if (editing) {
        await staffApi.updateRoom(editing.roomID, payload);
      } else {
        await staffApi.createRoom(payload);
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        alert(
          'Access denied (403). Please log in with a staff account (e.g. staff@gmail.com / 123456).'
        );
      } else {
        alert(
          'Error saving room. If room belongs to bookings, backend should only change status.'
        );
      }
    }
  };

  const onDelete = async (r) => {
    if (!window.confirm(`Delete room ${r.roomNumber}?`)) return;
    try {
      await staffApi.deleteRoom(r.roomID);
      loadData();
    } catch (err) {
      // Theo yêu cầu: nếu đã thuộc booking, backend chỉ cập nhật status
      console.error(err);
      alert(
        'Cannot hard delete this room because it is in bookings. Backend should change status instead.'
      );
    }
  };

  const renderStatusBadge = (r) => {
    // 'occupied' means the booking is active today
    if (r.occupied) return <span className="badge orange">In use</span>;
    // status 2 means approved/reserved but not yet started (or future)
    if (r.roomStatus === 2) return <span className="badge purple">Booked</span>;
    if (r.roomStatus === 1) return <span className="badge green">Available</span>;
    if (r.roomStatus === 0) return <span className="badge gray">Inactive</span>;
    return <span className="badge red">Unknown</span>;
  };

  return (
    <div>
      <h1 className="page-title">Manage Rooms</h1>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1.2fr' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem' }}>Room List</h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Number</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Price/day</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.roomID}>
                    <td>{r.roomID}</td>
                    <td>{r.roomNumber}</td>
                    <td>{r.roomType?.roomTypeName}</td>
                    <td>{r.roomMaxCapacity}</td>
                    <td>{r.roomPricePerDay}</td>
                    <td>{renderStatusBadge(r)}</td>
                    <td>
                      <button
                        className="btn secondary"
                        style={{ marginRight: '0.25rem' }}
                        onClick={() => startEdit(r)}
                      >
                        Edit
                      </button>
                      <button className="btn danger" onClick={() => onDelete(r)}>
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
            {editing ? 'Edit Room' : 'Create Room'}
          </h2>
          <form className="form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="roomNumber">
                Room number
              </label>
              <input
                id="roomNumber"
                className="form-input"
                name="roomNumber"
                value={form.roomNumber}
                onChange={onChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roomDetailDescription">
                Description
              </label>
              <textarea
                id="roomDetailDescription"
                className="form-input"
                name="roomDetailDescription"
                value={form.roomDetailDescription}
                onChange={onChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roomMaxCapacity">
                Max capacity
              </label>
              <input
                id="roomMaxCapacity"
                className="form-input"
                type="number"
                min="1"
                name="roomMaxCapacity"
                value={form.roomMaxCapacity}
                onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roomPricePerDay">
                Price per day
              </label>
              <input
                id="roomPricePerDay"
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                name="roomPricePerDay"
                value={form.roomPricePerDay === 0 ? '' : form.roomPricePerDay}
                onChange={onChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roomStatus">
                Status
              </label>
              <select
                id="roomStatus"
                className="form-input"
                name="roomStatus"
                value={form.roomStatus}
                onChange={onChange}
              >
                <option value={1}>Available (1)</option>
                <option value={0}>Inactive (0)</option>
                <option value={2}>Booked (2)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="roomTypeID">
                Room type
              </label>
              <select
                id="roomTypeID"
                className="form-input"
                name="roomTypeID"
                value={form.roomTypeID}
                onChange={onChange}
                required
              >
                <option value="">Select room type</option>
                {(Array.isArray(roomTypes) ? roomTypes : []).map((t, idx) => {
                  const id = t?.roomTypeID ?? t?.room_typeid ?? t?.roomTypeId;
                  const name = t?.roomTypeName ?? t?.room_type_name ?? 'Unknown';
                  return (
                    <option key={id ?? idx} value={id != null ? String(id) : ''}>
                      {name}
                    </option>
                  );
                })}
              </select>
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

export default StaffRoomsPage;
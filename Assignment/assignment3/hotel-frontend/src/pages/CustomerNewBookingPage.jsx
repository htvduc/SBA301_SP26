import React, { useEffect, useState } from 'react';
import roomApi from '../api/roomApi';
import customerApi from '../api/customerApi';
import LoadingSpinner from '../components/LoadingSpinner';

function CustomerNewBookingPage() {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (dates.startDate && dates.endDate) {
      setLoadingRooms(true);
      roomApi
        .getAvailable(dates.startDate, dates.endDate)
        .then((data) => setRooms(Array.isArray(data) ? data : []))
        .catch((e) => {
          console.error(e);
          setRooms([]);
        })
        .finally(() => setLoadingRooms(false));
    } else {
      setRooms([]);
    }
  }, [dates.startDate, dates.endDate]);

  const toggleRoom = (room) => {
    setSelectedRooms((prev) => {
      const exists = prev.find((r) => r.roomID === room.roomID);
      if (exists) {
        return prev.filter((r) => r.roomID !== room.roomID);
      }
      return [...prev, room];
    });
  };

  const onDateChange = (e) => {
    const { name, value } = e.target;
    setDates((prev) => ({ ...prev, [name]: value }));
  };

  const calcNights = () => {
    if (!dates.startDate || !dates.endDate) return 0;
    const start = new Date(dates.startDate);
    const end = new Date(dates.endDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const nights = calcNights();
  const totalPrice =
    nights > 0
      ? selectedRooms.reduce((sum, r) => {
          const price = Number(r.roomPricePerDay || 0);
          return sum + price * nights;
        }, 0)
      : 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!nights || selectedRooms.length === 0) {
      alert('Please select at least one room and a valid date range');
      return;
    }
    setSubmitting(true);

    // Mapping sang backend BookingReservation + BookingDetail (giả định DTO)
    const bookingDetails = selectedRooms.map((r) => ({
      roomID: r.roomID,
      startDate: dates.startDate,
      endDate: dates.endDate,
      actualPrice: r.roomPricePerDay
    }));

    const payload = {
      bookingDate: new Date().toISOString().slice(0, 10),
      totalPrice,
      details: bookingDetails
    };

    try {
      await customerApi.createBooking(payload);
      alert('Đã đặt phòng thành công, vui lòng chờ phê duyệt');
      setSelectedRooms([]);
      setDates({ startDate: '', endDate: '' });
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      const msg = (typeof data === 'string' ? data : data?.message || data?.error || err.message) || 'Create booking failed';
      alert(typeof msg === 'string' ? msg : 'Create booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Create New Booking</h1>
      <form className="card" onSubmit={onSubmit} style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
          Chọn ngày check-in và check-out, sau đó danh sách phòng khả dụng sẽ hiển thị. Phòng đã được approve sẽ không khả dụng cho đến khi hết hạn thuê.
        </p>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="startDate">
              Start date
            </label>
            <input
              id="startDate"
              className="form-input"
              type="date"
              name="startDate"
              value={dates.startDate}
              onChange={onDateChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="endDate">
              End date
            </label>
            <input
              id="endDate"
              className="form-input"
              type="date"
              name="endDate"
              value={dates.endDate}
              onChange={onDateChange}
            />
          </div>
        </div>

        <p>
          Nights: <strong>{nights}</strong> | Total price:{' '}
          <strong>{totalPrice}</strong>
        </p>

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Booking'}
        </button>
      </form>

      <div className="card">
        <h2 style={{ fontSize: '1rem' }}>Select rooms</h2>
        {!dates.startDate || !dates.endDate ? (
          <p style={{ color: 'var(--text-muted)' }}>Vui lòng chọn ngày check-in và check-out trước.</p>
        ) : loadingRooms ? (
          <LoadingSpinner />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th />
                <th>Room</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Price/day</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => {
                const checked = selectedRooms.some((s) => s.roomID === r.roomID);
                return (
                  <tr key={r.roomID}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRoom(r)}
                      />
                    </td>
                    <td>{r.roomNumber}</td>
                    <td>{r.roomType?.roomTypeName}</td>
                    <td>{r.roomMaxCapacity}</td>
                    <td>{r.roomPricePerDay}</td>
                    <td>Available</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CustomerNewBookingPage;
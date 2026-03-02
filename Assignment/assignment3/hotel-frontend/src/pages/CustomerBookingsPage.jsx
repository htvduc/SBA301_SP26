import React, { useEffect, useState } from 'react';
import customerApi from '../api/customerApi';
import LoadingSpinner from '../components/LoadingSpinner';

function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi
      .getBookings()
      .then(setBookings)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = (s) => {
    if (s === 0) return <span className="badge orange">Pending</span>;
    if (s === 1) return <span className="badge green">Approved</span>;
    if (s === 2) return <span className="badge red">Cancelled</span>;
    return <span className="badge gray">{String(s)}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="page-title">My Booking History</h1>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Booking Date</th>
              <th>Rooms</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const details = b.bookingDetails || [];
              const checkIn = details.reduce((min, d) => {
                if (!d.startDate) return min;
                return !min || d.startDate < min ? d.startDate : min;
              }, null);
              const checkOut = details.reduce((max, d) => {
                if (!d.endDate) return max;
                return !max || d.endDate > max ? d.endDate : max;
              }, null);
              return (
                <tr key={b.bookingReservationID}>
                  <td>{b.bookingReservationID}</td>
                  <td>{b.bookingDate}</td>
                  <td>
                    {details.map((d) => d.room?.roomNumber || '?').join(', ')}
                  </td>
                  <td>{checkIn || '-'}</td>
                  <td>{checkOut || '-'}</td>
                  <td>${b.totalPrice}</td>
                  <td>{statusLabel(b.bookingStatus)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerBookingsPage;
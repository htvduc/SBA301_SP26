import React, { useEffect, useState } from "react";
import staffApi from "../api/staffApi";
import LoadingSpinner from "../components/LoadingSpinner";

// Status:
// 0 = Pending
// 1 = Approved
// 2 = Cancelled

function StaffBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Change booking status
  const changeStatus = async (booking, status) => {
    try {
      await staffApi.updateBookingStatus(
        booking.bookingReservationID,
        status
      );
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Delete booking
  const deleteBooking = async (booking) => {
    const confirmDelete = window.confirm(
      `Delete booking ${booking.bookingReservationID}?`
    );
    if (!confirmDelete) return;

    try {
      await staffApi.deleteBooking(booking.bookingReservationID);
      loadData();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="badge orange">Pending</span>;
      case 1:
        return <span className="badge green">Approved</span>;
      case 2:
        return <span className="badge red">Cancelled</span>;
      default:
        return <span className="badge gray">{String(status)}</span>;
    }
  };

  // Render action buttons
  const renderActions = (booking) => {
    const details = booking.bookingDetails || [];

    const now = new Date().toISOString().slice(0, 10);

    const isPast =
      details.length > 0 &&
      details.every((d) => d.endDate && d.endDate < now);

    return (
      <>
        {booking.bookingStatus === 0 && (
          <>
            <button
              className="btn"
              style={{ marginRight: "0.25rem" }}
              onClick={() => changeStatus(booking, 1)}
            >
              Approve
            </button>
            <button
              className="btn danger"
              onClick={() => changeStatus(booking, 2)}
            >
              Cancel
            </button>
          </>
        )}

        {booking.bookingStatus === 1 && (
          <span className="badge green">Approved</span>
        )}

        {booking.bookingStatus === 2 && (
          <span className="badge gray">Cancelled</span>
        )}

        {isPast && (
          <button
            className="btn danger"
            style={{ marginLeft: "0.25rem" }}
            onClick={() => deleteBooking(booking)}
          >
            Delete
          </button>
        )}
      </>
    );
  };

  return (
    <div>
      <h1 className="page-title">Manage Booking Reservations</h1>

      <div className="card">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Booking Date</th>
                <th>Rooms</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => {
                const details = booking.bookingDetails || [];

                const checkIn = details.reduce((min, d) => {
                  if (!d.startDate) return min;
                  return !min || d.startDate < min
                    ? d.startDate
                    : min;
                }, null);

                const checkOut = details.reduce((max, d) => {
                  if (!d.endDate) return max;
                  return !max || d.endDate > max
                    ? d.endDate
                    : max;
                }, null);

                const roomNumbers = details
                  .map((d) => d.room?.roomNumber || "?")
                  .join(", ");

                return (
                  <tr key={booking.bookingReservationID}>
                    <td>{booking.bookingReservationID}</td>
                    <td>{booking.customer?.customerFullName}</td>
                    <td>{booking.bookingDate}</td>
                    <td>{roomNumbers || "-"}</td>
                    <td>{checkIn || "-"}</td>
                    <td>{checkOut || "-"}</td>
                    <td>${booking.totalPrice}</td>
                    <td>{renderStatusBadge(booking.bookingStatus)}</td>
                    <td>{renderActions(booking)}</td>
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

export default StaffBookingsPage;
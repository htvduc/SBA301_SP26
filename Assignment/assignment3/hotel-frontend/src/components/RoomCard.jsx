import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

function RoomCard({ room }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If the API tells us the room is occupied (has approved booking covering today), show Booked
  const status = room.occupied
    ? { label: 'Booked', color: 'purple' }
    : room.roomStatus === 1
      ? { label: 'Available', color: 'green' }
      : room.roomStatus === 2
        ? { label: 'Booked', color: 'purple' }
        : { label: 'Unavailable', color: 'red' };

  const isAvailable = status.label === 'Available';

  const handleClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/customer/new-booking' } } });
    } else {
      navigate('/customer/new-booking');
    }
  };

  return (
    <div
      className={`card ${isAvailable ? 'clickable' : ''}`}
      onClick={isAvailable ? handleClick : undefined}
      title={isAvailable ? 'Click to book this room' : ''}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          Room {room.roomNumber} ({room.roomType?.roomTypeName || 'N/A'})
        </h3>
        <span className={`badge ${status.color}`}>{status.label}</span>
      </div>
      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
        {room.roomDetailDescription || 'No description'}
      </p>
      <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
        Capacity: {room.roomMaxCapacity} guests
      </p>
      <p style={{ fontWeight: 600, marginTop: '0.25rem' }}>
        Price: {room.roomPricePerDay} / day
      </p>
      {isAvailable && (
        <p style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '0.5rem' }}>
          Click to book →
        </p>
      )}
    </div>
  );
}

export default RoomCard;
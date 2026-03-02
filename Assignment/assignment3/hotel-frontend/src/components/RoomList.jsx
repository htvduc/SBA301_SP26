import React from 'react';
import RoomCard from './RoomCard';

function RoomList({ rooms }) {
  if (!rooms || rooms.length === 0) {
    return <p>No rooms found.</p>;
  }

  return (
    <div className="grid grid-3">
      {rooms.map((room) => (
        <RoomCard key={room.roomID} room={room} />
      ))}
    </div>
  );
}

export default RoomList;
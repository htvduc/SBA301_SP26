import React, { useEffect, useState } from 'react';
import roomApi from '../api/roomApi';
import RoomList from '../components/RoomList';
import LoadingSpinner from '../components/LoadingSpinner';

function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    roomApi
      .getAllWithStatus(today)
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        // Show all rooms except inactive (status=0)
        setRooms(all.filter((r) => r.roomStatus !== 0));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">All Rooms</h1>
      {loading ? <LoadingSpinner /> : <RoomList rooms={rooms} />}
    </div>
  );
}

export default HomePage;
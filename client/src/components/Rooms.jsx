import { useEffect } from 'react';
import { useContext } from 'react';
import { AppContext } from '../App';

export function Rooms() {
    const { user, rooms, setRoom, dispatch } = useContext(AppContext);

    useEffect(() => {
        fetch('http://localhost:5000/rooms', {
            headers: { Authorization: `bearer token ${user}` },
        })
            .then((res) => res.json())
            .then((rooms) => {
                dispatch({ type: 'rooms', payload: rooms });
            });
    }, []);

    return (
        <div className="flex column">
            <h2>Rooms</h2>
            {rooms.map((room) => (
                <button key={room.room.id} onClick={() => setRoom(room.room)}>
                    {room.room.name}
                </button>
            ))}
        </div>
    );
}

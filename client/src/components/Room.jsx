import { useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../App';
import { RoomUsers } from './RoomUsers';

export function Room() {
    const [roomData, setRoomData] = useState(null);
    const { room, user, setRoom, rooms } = useContext(AppContext);

    useEffect(() => {
        fetch('http://localhost:5000/rooms/' + room.id, {
            headers: { Authorization: `bearer token ${user}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setRoomData(data);
            });
    }, [room]);

    const leaveRoom = () => {
        const roomUser = rooms.find((r) => r.room.id === room.id);
        fetch('http://localhost:5000/rooms/leave/' + roomUser.id, {
            method: 'DELETE',
            headers: { Authorization: `bearer token ${user}` },
        }).then(() => setRoom(null));
    };

    return (
        <div className="flex column grow">
            <h1>{room.name}</h1>
            <button onClick={() => leaveRoom()}>Leave Room</button>
            <div className="flex">
                <div className="grow">messages here</div>
                {roomData && <RoomUsers data={roomData} />}
            </div>
        </div>
    );
}

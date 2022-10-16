import { useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../App';
import { RoomUsers } from './RoomUsers';

export function Room() {
    const [roomData, setRoomData] = useState(null);
    const { room, user } = useContext(AppContext);

    useEffect(() => {
        fetch('http://localhost:5000/rooms/' + room.id, {
            headers: { Authorization: `bearer token ${user}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setRoomData(data);
            });
    }, [room]);
    return (
        <div className="flex column grow">
            <h1>{room.name}</h1>
            <div className="flex">
                <div className="grow">messages here</div>
                {roomData && <RoomUsers data={roomData} />}
            </div>
        </div>
    );
}

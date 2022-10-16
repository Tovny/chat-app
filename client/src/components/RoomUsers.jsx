import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { AppContext } from '../App';

export function RoomUsers({ data }) {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [offlineUsers, setOfflineUsers] = useState([]);
    const { newConnection } = useContext(AppContext);

    useEffect(() => {
        const offlineUsers = data.room.users.filter(
            (u) => !data.onlineUsers.map((user) => user.id).includes(u.id)
        );
        setOfflineUsers(offlineUsers);
        setOnlineUsers(data.onlineUsers);
    }, [data]);

    useEffect(() => {
        if (newConnection) {
            if (offlineUsers.map((u) => u.user.id).includes(newConnection.id)) {
                const newOffline = offlineUsers.filter(
                    (u) => u.user.id !== newConnection.id
                );
            }
        }
    }, [newConnection]);

    return (
        <div>
            <h3>Online</h3>
            {onlineUsers.map((u) => (
                <p style={{ color: 'green' }}>{u.user?.username}</p>
            ))}
            <h3>Offline</h3>
            {offlineUsers.map((u) => (
                <p>{u.user?.username}</p>
            ))}
        </div>
    );
}

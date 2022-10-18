import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { AppContext } from '../App';
import {uniqBy} from 'lodash'

export function RoomUsers({ data }) {
    const [offlineUsers, setOfflineUsers] = useState([]);
    const { onlineUsers } = useContext(AppContext);
    const [onlineMembers, setOnlineMembers] = useState([]);

    useEffect(() => {
        let online = onlineUsers.filter((u) =>
            data.users.map((user) => user.user.id).includes(u.id)
        );
        let offlineUsers = data.users.filter(
            (u) => !onlineUsers.map((user) => user.id).includes(u.user.id)
        );
        setOnlineMembers(uniqBy(online,'id'));

        setOfflineUsers(uniqBy(offlineUsers,'id'));
    }, [data, onlineUsers]);

    return (
        <div>
            <h3>Online</h3>

            {onlineMembers.map((u) => (
                <p style={{ color: 'green' }}>{u.username}</p>
            ))}
            <h3>Offline</h3>
            {offlineUsers.map((u) => (
                <p>{u.user?.username}</p>
            ))}
        </div>
    );
}

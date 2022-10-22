import { useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../App';
import { Message } from './Message';
import { RoomUsers } from './RoomUsers';

export function Room() {
    const [roomData, setRoomData] = useState(null);
    const [message, setMessage] = useState('');
    const [msgTotal, setMsgTotal] = useState(0);
    const { room, user, rooms, messages, countChange, dispatch } =
        useContext(AppContext);

    useEffect(() => {
        fetch('http://localhost:5000/rooms/' + room.id, {
            headers: { Authorization: `bearer token ${user}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setRoomData(data);
                setMsgTotal(data.messageTotal);
                return dispatch({ type: 'messages', payload: data.messages });
            });
    }, [room]);

    useEffect(() => {
        if (countChange) {
            setMsgTotal(msgTotal + countChange);
            dispatch({ type: 'resetCountChange' });
        }
    }, [countChange]);

    const leaveRoom = () => {
        const roomUser = rooms.find((r) => r.room.id === room.id);
        fetch('http://localhost:5000/rooms/leave/' + roomUser.id, {
            method: 'DELETE',
            headers: { Authorization: `bearer token ${user}` },
        }).then(() => dispatch({ type: 'setRoom', payload: null }));
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        fetch('http://localhost:5000/messages/' + room.id, {
            method: 'POST',
            headers: {
                Authorization: `bearer token ${user}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: message }),
        }).then(() => setMessage(''));
    };

    const getMessages = () => {
        fetch(
            'http://localhost:5000/messages/' +
                room.id +
                `/?skip=${messages.length}&take=1`,
            {
                method: 'GET',
                headers: { Authorization: `bearer token ${user}` },
            }
        )
            .then((data) => {
                return data.json();
            })
            .then((messages) => {
                dispatch({ type: 'addMessages', payload: messages });
            });
    };

    return (
        roomData && (
            <div className="flex column grow">
                <h1>{room.name}</h1>
                <button onClick={leaveRoom}>Leave Room</button>
                {msgTotal > messages.length && (
                    <button onClick={getMessages}>Load more messages</button>
                )}
                <div className="flex">
                    <div
                        className="flex column grow"
                        style={{ height: 'calc(100vh - 200px)' }}
                    >
                        <div style={{ overflow: 'auto' }}>
                            {messages.map((msg) => (
                                <Message key={msg.id} message={msg} />
                            ))}
                        </div>
                        <form
                            style={{ marginTop: 'auto', width: '100%' }}
                            onSubmit={handleSubmit}
                        >
                            <input
                                style={{ width: '80%' }}
                                placeholder="message here"
                                value={message}
                                onChange={(evt) => setMessage(evt.target.value)}
                            ></input>
                        </form>
                    </div>
                    {roomData && <RoomUsers data={roomData} />}
                </div>
            </div>
        )
    );
}
